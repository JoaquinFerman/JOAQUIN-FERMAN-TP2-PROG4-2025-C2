import { Injectable, NotFoundException, Logger, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreatePublicacioneDto } from './dto/create-publicacione.dto';
import { UpdatePublicacioneDto } from './dto/update-publicacione.dto';
import { Publicacione, PublicacioneDocument } from './entities/publicacione.entity';

@Injectable()
export class PublicacionesService {
  private readonly logger = new Logger(PublicacionesService.name);
  constructor(
    @InjectModel(Publicacione.name) private publicacioneModel: Model<PublicacioneDocument>
  ) {}

  async create(createPublicacioneDto: CreatePublicacioneDto) {
    const post = new this.publicacioneModel({
      ...createPublicacioneDto,
      title: createPublicacioneDto.title || undefined,
      description: createPublicacioneDto.description || undefined,
      content: createPublicacioneDto.content || undefined,
      date: createPublicacioneDto.date || new Date(),
      likesCount: 0,
      liked: false,
      isOwn: createPublicacioneDto.isOwn || false,
      comments: [],
      likedUsers: [],
      deleted: false,
    });
    try {
      const saved = await post.save();
      this.logger.log(`Post creado: ${saved._id} (${saved.userName})`);
      return saved;
    } catch (err) {
      this.logger.error(`Error creando publicación (${createPublicacioneDto.userName}): ${err?.message || err}`, err?.stack);
      // Return a proper HTTP 500
      const { InternalServerErrorException } = await import('@nestjs/common');
      throw new InternalServerErrorException('Error interno al crear la publicación');
    }
  }

  async findAll(options?: { order?: 'fecha' | 'meGusta'; userId?: string; offset?: number; limit?: number; currentUserId?: string }) {
    const filter: any = { deleted: { $ne: true } };
    if (options?.userId) filter.userId = String(options.userId);

    let query = this.publicacioneModel.find(filter);

    // Sorting
    if (options?.order === 'meGusta') {
      query = query.sort({ likesCount: -1 });
    } else {
      query = query.sort({ date: -1 });
    }

    // Pagination
    if (typeof options?.offset === 'number' && options.offset > 0) {
      query = query.skip(options.offset);
    }
    if (typeof options?.limit === 'number' && options.limit > 0) {
      query = query.limit(options.limit);
    }

    let posts = await query.exec();

    // Add 'liked' property based on currentUserId
    if (options?.currentUserId) {
      const currentUserId = options.currentUserId;
      posts = posts.map(post => {
        const postObj = post.toObject();
        postObj.liked = postObj.likedUsers?.includes(currentUserId) || false;
        return postObj;
      }) as any;
    }

    if (typeof options?.limit === 'number' && options.limit > 0) {
      const total = await this.publicacioneModel.countDocuments(filter).exec();
      return { total, posts } as any;
    }

    return posts;
  }

  async findOne(id: string) {
    const post = await this.publicacioneModel.findOne({ _id: id, deleted: { $ne: true } }).exec();
    if (!post) throw new NotFoundException('Publicación no encontrada');
    return post;
  }

  async update(id: string, updatePublicacioneDto: UpdatePublicacioneDto) {
    const post = await this.publicacioneModel.findByIdAndUpdate(
      id,
      updatePublicacioneDto,
      { new: true }
    ).exec();
    if (!post) throw new NotFoundException('Publicación no encontrada');
    return post;
  }

  /**
   * Remove a publication. If userId is provided, verify ownership before deleting.
   */
  async remove(id: string, user?: { id?: string; nombreUsuario?: string; nombre?: string; perfil?: string; roles?: string[] }) {
    const post = await this.publicacioneModel.findById(id).exec();
    if (!post) throw new NotFoundException('Publicación no encontrada');

    // Logical deletion: only owner or admin
    if (user && user.id) {
      const isOwner = String((post as any).userId) === String(user.id);
      const isAdmin = user.perfil === 'administrador' || (user.roles && user.roles.includes('admin'));
      
      if (!isOwner && !isAdmin) {
        this.logger.warn(`Usuario ${user.id} intentó borrar publicación ${id} sin ser dueño ni administrador`);
        throw new ForbiddenException('No permitido: solo el dueño o un administrador puede eliminar esta publicación');
      }
    } else if (user && (user.nombreUsuario || user.nombre)) {
      const matchesName = (user.nombreUsuario && String(post.userName) === String(user.nombreUsuario)) ||
        (user.nombre && String(post.userName) === String(user.nombre));
      const isAdmin = user.perfil === 'administrador' || (user.roles && user.roles.includes('admin'));
      
      if (!matchesName && !isAdmin) {
        this.logger.warn(`Usuario ${JSON.stringify(user)} intentó borrar publicación ${id} sin ser dueño ni administrador (name mismatch)`);
        throw new ForbiddenException('No permitido: solo el dueño o un administrador puede eliminar esta publicación');
      }
    }

    post.deleted = true;
    post.deletedAt = new Date();
    const saved = await post.save();
    return saved;
  }

  async addComment(postId: string, comment: { userName: string; userPhoto?: string; content: string; date?: Date }) {
    this.logger.log(`Agregando comentario al post ${postId}:`, JSON.stringify(comment));
  const post = await this.publicacioneModel.findOne({ _id: postId, deleted: { $ne: true } }).exec();
    if (!post) throw new NotFoundException('Publicación no encontrada');
    
    const newComment = { 
      ...comment, 
      date: comment.date || new Date(),
      modified: false
    };
    post.comments.push(newComment);

    this.logger.log(`Comments antes de guardar:`, JSON.stringify(post.comments));
    try {
      const saved = await post.save();
      this.logger.log(`Comments después de guardar:`, JSON.stringify(saved.comments));
      this.logger.log(`Comentario creado en post ${postId} por ${comment.userName}`);
      return saved;
    } catch (err) {
      this.logger.error(`Error guardando comentario en post ${postId}: ${err?.message || err}`, err?.stack);
      // Throw an HTTP-friendly exception so client receives a proper 500 response
      // while preserving a clear message in logs.
      const { InternalServerErrorException } = await import('@nestjs/common');
      throw new InternalServerErrorException('Error interno al guardar el comentario');
    }
  }

  async like(postId: string, userId: string) {
    this.logger.log(`Agregando like al post ${postId} por usuario ${userId}`);
  const post = await this.publicacioneModel.findOne({ _id: postId, deleted: { $ne: true } }).exec();
    if (!post) throw new NotFoundException('Publicación no encontrada');
    
    post.likedUsers = post.likedUsers || [];
    this.logger.log(`likedUsers antes: ${JSON.stringify(post.likedUsers)}`);
    
    if (!post.likedUsers.includes(userId)) {
      post.likedUsers.push(userId);
      post.likesCount = post.likedUsers.length;
      
      this.logger.log(`likedUsers después: ${JSON.stringify(post.likedUsers)}, likesCount: ${post.likesCount}`);
      const saved = await post.save();
      this.logger.log(`Like guardado. likedUsers final: ${JSON.stringify(saved.likedUsers)}`);
      return saved;
    }
    
    this.logger.log(`Usuario ${userId} ya dio like a este post`);
    return post;
  }

  async unlike(postId: string, userId: string) {
    this.logger.log(`Quitando like del post ${postId} por usuario ${userId}`);
  const post = await this.publicacioneModel.findOne({ _id: postId, deleted: { $ne: true } }).exec();
    if (!post) throw new NotFoundException('Publicación no encontrada');
    
    post.likedUsers = post.likedUsers || [];
    this.logger.log(`likedUsers antes: ${JSON.stringify(post.likedUsers)}`);
    
    post.likedUsers = post.likedUsers.filter((id: string) => id !== userId);
    post.likesCount = post.likedUsers.length;
    
    this.logger.log(`likedUsers después: ${JSON.stringify(post.likedUsers)}, likesCount: ${post.likesCount}`);
    const saved = await post.save();
    this.logger.log(`Unlike guardado. likedUsers final: ${JSON.stringify(saved.likedUsers)}`);
    
    return saved;
  }

  async findLastThreeByUser(userId: string) {
    return this.publicacioneModel
      .find({ userId, deleted: { $ne: true } })
      .sort({ date: -1 })
      .limit(3)
      .exec();
  }

  async addImageToPost(postId: string, imageUrl: string) {
    const post = await this.publicacioneModel.findOne({ _id: postId, deleted: { $ne: true } }).exec();
    if (!post) throw new NotFoundException('Publicación no encontrada');
    
    // Inicializar el array si no existe
    if (!post.images) {
      (post as any).images = [];
    }
    
    // Agregar la nueva URL al array
    (post as any).images.push(imageUrl);
    
    await post.save();
    return post;
  }

  async getCommentsPaginated(postId: string, page: number = 1, limit: number = 10) {
    const post = await this.publicacioneModel.findOne({ _id: postId, deleted: { $ne: true } }).exec();
    if (!post) throw new NotFoundException('Publicación no encontrada');
    
    // Ordenar comentarios por fecha (más recientes primero)
    const allComments = [...post.comments].sort((a: any, b: any) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedComments = allComments.slice(startIndex, endIndex);
    
    return {
      comments: paginatedComments,
      total: allComments.length,
      page,
      limit,
      hasMore: endIndex < allComments.length
    };
  }

  async editComment(postId: string, commentId: string, userId: string, newContent: string) {
    this.logger.log(`Editando comentario ${commentId} del post ${postId} por usuario ${userId}`);
    const post = await this.publicacioneModel.findOne({ _id: postId, deleted: { $ne: true } }).exec();
    if (!post) throw new NotFoundException('Publicación no encontrada');
    
    const comment = post.comments.find((c: any) => c._id && c._id.toString() === commentId);
    if (!comment) throw new NotFoundException('Comentario no encontrado');
    
    // Verificar que el usuario sea el autor del comentario
    // Comparar por userName ya que los comentarios no tienen userId
    const commentAny = comment as any;
    if (commentAny.userName !== userId) {
      this.logger.warn(`Usuario ${userId} intentó editar comentario de ${commentAny.userName}`);
      throw new ForbiddenException('Solo el autor del comentario puede editarlo');
    }
    
    commentAny.content = newContent;
    commentAny.modified = true;
    commentAny.modifiedAt = new Date();
    
    const saved = await post.save();
    this.logger.log(`Comentario ${commentId} editado exitosamente`);
    return saved;
  }

  // Estadísticas: Publicaciones por usuario en un lapso de tiempo
  async getPublicacionesPorUsuario(fechaInicio?: string, fechaFin?: string) {
    const filter: any = { deleted: { $ne: true } };
    
    if (fechaInicio || fechaFin) {
      filter.date = {};
      if (fechaInicio) filter.date.$gte = new Date(fechaInicio);
      if (fechaFin) filter.date.$lte = new Date(fechaFin);
    }

    const result = await this.publicacioneModel.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$userId',
          userName: { $first: '$userName' },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    return result.map(item => ({
      userId: item._id,
      userName: item.userName,
      cantidadPublicaciones: item.count
    }));
  }

  // Estadísticas: Comentarios totales en un lapso de tiempo
  async getComentariosTotales(fechaInicio?: string, fechaFin?: string) {
    const filter: any = { deleted: { $ne: true } };
    
    const posts = await this.publicacioneModel.find(filter).exec();
    
    let totalComentarios = 0;
    const comentariosPorFecha: { [key: string]: number } = {};

    for (const post of posts) {
      for (const comment of post.comments as any[]) {
        const commentDate = new Date(comment.date);
        
        // Filtrar por fecha si se especificó
        if (fechaInicio && commentDate < new Date(fechaInicio)) continue;
        if (fechaFin && commentDate > new Date(fechaFin)) continue;
        
        totalComentarios++;
        const dateKey = commentDate.toISOString().split('T')[0];
        comentariosPorFecha[dateKey] = (comentariosPorFecha[dateKey] || 0) + 1;
      }
    }

    return {
      total: totalComentarios,
      porFecha: Object.entries(comentariosPorFecha).map(([fecha, cantidad]) => ({
        fecha,
        cantidad
      })).sort((a, b) => a.fecha.localeCompare(b.fecha))
    };
  }

  // Estadísticas: Comentarios por publicación en un lapso de tiempo
  async getComentariosPorPublicacion(fechaInicio?: string, fechaFin?: string) {
    const filter: any = { deleted: { $ne: true } };
    
    const posts = await this.publicacioneModel.find(filter).exec();
    
    const result = posts.map(post => {
      let comentariosFiltrados = post.comments as any[];
      
      // Filtrar comentarios por fecha
      if (fechaInicio || fechaFin) {
        comentariosFiltrados = comentariosFiltrados.filter((comment: any) => {
          const commentDate = new Date(comment.date);
          if (fechaInicio && commentDate < new Date(fechaInicio)) return false;
          if (fechaFin && commentDate > new Date(fechaFin)) return false;
          return true;
        });
      }

      return {
        publicacionId: (post as any)._id,
        userName: post.userName,
        content: post.content?.substring(0, 50) + '...',
        cantidadComentarios: comentariosFiltrados.length
      };
    }).filter(item => item.cantidadComentarios > 0)
      .sort((a, b) => b.cantidadComentarios - a.cantidadComentarios);

    return result;
  }
}
