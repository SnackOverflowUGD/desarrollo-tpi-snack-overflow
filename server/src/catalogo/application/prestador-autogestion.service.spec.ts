/**
 * Unit tests for PrestadorAutogestionService (Slice 2).
 *
 * Repositories, DataSource and QueryRunner are mocked — no DB. The point of
 * these tests is the APPLICATION rules:
 *  - publishing recompute is atomic with the servicio mutation (PSM-REQ-06):
 *    first visible servicio → tieneServiciosPublicados=true (ESC-PSM-11);
 *    hiding/deleting the last visible servicio → false (ESC-PSM-12/15).
 *  - localidad change regenerates zonaCobertura via fromCircle (ESC-PSM-05).
 *  - unknown localidad → 400 (ESC-PSM-06).
 *  - invalid price range (min>max) → 400 (ESC-PSM-10).
 *  - ownership guard → 404 on another prestador's servicio (ESC-PSM-14/16).
 */
import {
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrestadorAutogestionService } from './prestador-autogestion.service.js';
import { Prestador } from '../domain/prestador.entity.js';
import { Servicio } from '../domain/servicio.entity.js';
import type { IPrestadorRepository } from '../ports/prestador-repository.port.js';
import type { IServicioRepository } from '../ports/servicio-repository.port.js';

// ---------------------------------------------------------------------------
// Fixtures + mocks
// ---------------------------------------------------------------------------

const SUB = 'prestador-1';

function makePrestador(overrides: Partial<Prestador> = {}): Prestador {
  const p = new Prestador();
  p.id = overrides.id ?? SUB;
  p.nombreCompleto = overrides.nombreCompleto ?? 'Ada Prestadora';
  p.oficios = overrides.oficios ?? ['electricista'];
  p.categoria = overrides.categoria ?? 'Electricista';
  p.localidad = overrides.localidad ?? 'Posadas';
  p.zonaCobertura = overrides.zonaCobertura ?? null;
  p.disponibilidadResumen = overrides.disponibilidadResumen ?? null;
  p.visible = overrides.visible ?? true;
  p.tieneServiciosPublicados = overrides.tieneServiciosPublicados ?? false;
  p.cuentaActiva = true;
  p.calificacionPromedio = 0;
  p.cantidadResenas = 0;
  return p;
}

function makeServicio(overrides: Partial<Servicio> = {}): Servicio {
  const s = new Servicio();
  s.id = overrides.id ?? 's1';
  s.prestadorId = overrides.prestadorId ?? SUB;
  s.categoria = overrides.categoria ?? 'Electricista';
  s.descripcion = overrides.descripcion ?? 'Instalaciones';
  s.rangoPrecioMin = overrides.rangoPrecioMin ?? 1000;
  s.rangoPrecioMax = overrides.rangoPrecioMax ?? 5000;
  s.visible = overrides.visible ?? true;
  return s;
}

function makeQueryRunner() {
  return {
    connect: jest.fn(async () => undefined),
    startTransaction: jest.fn(async () => undefined),
    commitTransaction: jest.fn(async () => undefined),
    rollbackTransaction: jest.fn(async () => undefined),
    release: jest.fn(async () => undefined),
    manager: {},
  };
}

function setup() {
  const prestadorRepo: jest.Mocked<IPrestadorRepository> = {
    findByCobertura: jest.fn(),
    findByIdWithProfile: jest.fn(),
    findById: jest.fn(async () => makePrestador()),
    create: jest.fn(),
    update: jest.fn(async (_id, patch) =>
      makePrestador(patch as Partial<Prestador>),
    ),
  } as never;

  const servicioRepo: jest.Mocked<IServicioRepository> = {
    findByPrestadorId: jest.fn(async () => []),
    findByPrestadorIdIncludingHidden: jest.fn(async () => []),
    findById: jest.fn(async () => null),
    countVisibleByPrestadorId: jest.fn(async () => 0),
    create: jest.fn(async (data) =>
      makeServicio({ id: 'new-s', ...(data as Partial<Servicio>) }),
    ),
    update: jest.fn(async (id, patch) =>
      makeServicio({ id, ...(patch as Partial<Servicio>) }),
    ),
    softDelete: jest.fn(async () => undefined),
  } as never;

  const qr = makeQueryRunner();
  const dataSource = { createQueryRunner: jest.fn(() => qr) } as never;

  const service = new PrestadorAutogestionService(
    prestadorRepo,
    servicioRepo,
    dataSource,
  );
  return { service, prestadorRepo, servicioRepo, qr };
}

// ---------------------------------------------------------------------------
// Publishing rules
// ---------------------------------------------------------------------------

describe('PrestadorAutogestionService — publishing recompute', () => {
  it('ESC-PSM-11: publishing the first visible servicio flips tieneServiciosPublicados=true', async () => {
    const { service, prestadorRepo, servicioRepo, qr } = setup();
    // After create, one visible servicio exists.
    servicioRepo.countVisibleByPrestadorId.mockResolvedValue(1);

    await service.crearServicio(SUB, {
      categoria: 'Electricista',
      descripcion: 'Instalaciones',
      rangoPrecioMin: 1000,
      rangoPrecioMax: 5000,
      visible: true,
    });

    // Recompute persisted inside the transaction with the qr.
    expect(servicioRepo.countVisibleByPrestadorId).toHaveBeenCalledWith(
      SUB,
      qr,
    );
    expect(prestadorRepo.update).toHaveBeenCalledWith(
      SUB,
      { tieneServiciosPublicados: true },
      qr,
    );
    expect(qr.commitTransaction).toHaveBeenCalledTimes(1);
    expect(qr.rollbackTransaction).not.toHaveBeenCalled();
  });

  it('ESC-PSM-12/15: soft-deleting the last visible servicio flips tieneServiciosPublicados=false', async () => {
    const { service, prestadorRepo, servicioRepo, qr } = setup();
    servicioRepo.findById.mockResolvedValue(makeServicio({ id: 's1' }));
    // After delete, zero visible servicios remain.
    servicioRepo.countVisibleByPrestadorId.mockResolvedValue(0);

    await service.eliminarServicio(SUB, 's1');

    expect(servicioRepo.softDelete).toHaveBeenCalledWith('s1', qr);
    expect(prestadorRepo.update).toHaveBeenCalledWith(
      SUB,
      { tieneServiciosPublicados: false },
      qr,
    );
    expect(qr.commitTransaction).toHaveBeenCalledTimes(1);
  });

  it('rolls back the transaction when a servicio mutation fails', async () => {
    const { service, servicioRepo, qr } = setup();
    servicioRepo.create.mockRejectedValue(new Error('db down'));

    await expect(
      service.crearServicio(SUB, {
        categoria: 'Electricista',
        descripcion: 'x',
        rangoPrecioMin: 1,
        rangoPrecioMax: 2,
        visible: true,
      }),
    ).rejects.toThrow('db down');

    expect(qr.rollbackTransaction).toHaveBeenCalledTimes(1);
    expect(qr.commitTransaction).not.toHaveBeenCalled();
    expect(qr.release).toHaveBeenCalledTimes(1);
  });
});

// ---------------------------------------------------------------------------
// Profile update
// ---------------------------------------------------------------------------

describe('PrestadorAutogestionService — profile update', () => {
  it('ESC-PSM-05: changing localidad regenerates zonaCobertura in one update', async () => {
    const { service, prestadorRepo } = setup();
    prestadorRepo.findById.mockResolvedValue(
      makePrestador({ localidad: 'Posadas' }),
    );

    await service.actualizarPerfil(SUB, { localidad: 'Oberá' });

    const [id, patch] = prestadorRepo.update.mock.calls[0];
    expect(id).toBe(SUB);
    expect(patch.localidad).toBe('Oberá');
    expect(patch.zonaCobertura).toBeDefined();
    // fromCircle produces a Polygon geometry centered on the new locality.
    expect(patch.zonaCobertura!.geometry.type).toBe('Polygon');
    expect(patch.zonaCobertura!.localidad).toBe('Oberá');
  });

  it('does NOT regenerate zona when localidad is unchanged', async () => {
    const { service, prestadorRepo } = setup();
    prestadorRepo.findById.mockResolvedValue(
      makePrestador({ localidad: 'Posadas' }),
    );

    await service.actualizarPerfil(SUB, {
      localidad: 'Posadas',
      visible: false,
    });

    const [, patch] = prestadorRepo.update.mock.calls[0];
    expect(patch.zonaCobertura).toBeUndefined();
    expect(patch.localidad).toBeUndefined();
    expect(patch.visible).toBe(false);
  });

  it('normalizes oficios (case-insensitive dedup) before persisting', async () => {
    const { service, prestadorRepo } = setup();
    prestadorRepo.findById.mockResolvedValue(
      makePrestador({ localidad: 'Posadas' }),
    );

    await service.actualizarPerfil(SUB, { oficios: ['gasista', 'Gasista'] });

    const [, patch] = prestadorRepo.update.mock.calls[0];
    expect(patch.oficios).toEqual(['gasista']);
  });

  it('ESC-PSM-06: unknown localidad is rejected with 400 and nothing is persisted', async () => {
    const { service, prestadorRepo } = setup();
    prestadorRepo.findById.mockResolvedValue(
      makePrestador({ localidad: 'Posadas' }),
    );

    await expect(
      service.actualizarPerfil(SUB, { localidad: 'Springfield' }),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(prestadorRepo.update).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Validation + ownership
// ---------------------------------------------------------------------------

describe('PrestadorAutogestionService — validation and ownership', () => {
  it('ESC-PSM-10: creating a servicio with min>max is rejected with 400 (no tx opened)', async () => {
    const { service, servicioRepo, qr } = setup();

    await expect(
      service.crearServicio(SUB, {
        categoria: 'Electricista',
        descripcion: 'x',
        rangoPrecioMin: 5000,
        rangoPrecioMax: 1000,
        visible: true,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(servicioRepo.create).not.toHaveBeenCalled();
    expect(qr.startTransaction).not.toHaveBeenCalled();
  });

  it('ESC-PSM-14/16: mutating another prestador servicio is rejected with 404', async () => {
    const { service, servicioRepo, qr } = setup();
    servicioRepo.findById.mockResolvedValue(
      makeServicio({ id: 's1', prestadorId: 'someone-else' }),
    );

    await expect(
      service.actualizarServicio(SUB, 's1', { descripcion: 'hack' }),
    ).rejects.toBeInstanceOf(NotFoundException);

    await expect(service.eliminarServicio(SUB, 's1')).rejects.toBeInstanceOf(
      NotFoundException,
    );

    expect(servicioRepo.update).not.toHaveBeenCalled();
    expect(servicioRepo.softDelete).not.toHaveBeenCalled();
    expect(qr.startTransaction).not.toHaveBeenCalled();
  });

  it('getMiPerfil throws 404 when the prestador does not exist', async () => {
    const { service, prestadorRepo } = setup();
    prestadorRepo.findById.mockResolvedValue(null);

    await expect(service.getMiPerfil(SUB)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('getMiPerfil returns the profile including hidden servicios', async () => {
    const { service, prestadorRepo, servicioRepo } = setup();
    prestadorRepo.findById.mockResolvedValue(
      makePrestador({ tieneServiciosPublicados: true }),
    );
    servicioRepo.findByPrestadorIdIncludingHidden.mockResolvedValue([
      makeServicio({ id: 's1', visible: true }),
      makeServicio({ id: 's2', visible: false }),
    ]);

    const perfil = await service.getMiPerfil(SUB);

    expect(perfil.servicios).toHaveLength(2);
    expect(perfil.servicios.map((s) => s.visible)).toEqual([true, false]);
    expect(perfil.tieneServiciosPublicados).toBe(true);
  });
});
