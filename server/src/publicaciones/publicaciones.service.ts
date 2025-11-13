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

  async findAll(options?: { order?: 'fecha' | 'meGusta'; userId?: string; offset?: number; limit?: number }) {
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

    const posts = await query.exec();

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
  async remove(id: string, user?: { id?: string; nombreUsuario?: string; nombre?: string }) {
    const post = await this.publicacioneModel.findById(id).exec();
    if (!post) throw new NotFoundException('Publicación no encontrada');

    // Logical deletion: only owner or admin
    if (user && user.id) {
      if (String((post as any).userId) !== String(user.id)) {
        // if user has roles and includes admin, allow
        const u: any = user as any;
        if (!u.roles || !Array.isArray(u.roles) || !u.roles.includes('admin')) {
          this.logger.warn(`Usuario ${user.id} intentó borrar publicación ${id} sin ser dueño`);
          throw new ForbiddenException('No permitido: solo el dueño o un administrador puede eliminar esta publicación');
        }
      }
    } else if (user && (user.nombreUsuario || user.nombre)) {
      const matchesName = (user.nombreUsuario && String(post.userName) === String(user.nombreUsuario)) ||
        (user.nombre && String(post.userName) === String(user.nombre));
      if (!matchesName) {
        this.logger.warn(`Usuario ${JSON.stringify(user)} intentó borrar publicación ${id} sin ser dueño (name mismatch)`);
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
}
