import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PublicacionesService } from './publicaciones.service';
import { PublicacionesController } from './publicaciones.controller';
import { ComentariosController } from './comentarios.controller';
import { Publicacione, PublicacioneSchema } from './entities/publicacione.entity';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Publicacione.name, schema: PublicacioneSchema }
    ]),
    SupabaseModule,
  ],
  controllers: [PublicacionesController, ComentariosController],
  providers: [PublicacionesService],
  exports: [],
})
export class PublicacionesModule {}
