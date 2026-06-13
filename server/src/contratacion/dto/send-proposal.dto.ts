import { IsDateString, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class SendProposalDto {
  @IsDateString()
  @IsNotEmpty()
  fecha: string;

  @IsString()
  @IsNotEmpty()
  franja: string;

  @IsNumber()
  @Min(0.01)
  precioEstimado: number;
}
