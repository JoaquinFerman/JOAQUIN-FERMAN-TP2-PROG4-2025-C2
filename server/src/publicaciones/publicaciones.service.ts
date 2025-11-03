import { Injectable, NotFoundException, Logger } from '@nestjs/common';
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
      date: createPublicacioneDto.date || new Date(),
      likesCount: 0,
      liked: false,
      isOwn: createPublicacioneDto.isOwn || false,
      comments: [],
      likedUsers: []
    });
    const saved = await post.save();
    this.logger.log(`Post creado: ${saved._id} (${saved.userName})`);
    return saved;
  }

  async findAll() {
    return this.publicacioneModel.find().exec();
  }

  async findOne(id: string) {
    const post = await this.publicacioneModel.findById(id).exec();
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

  async remove(id: string) {
    const post = await this.publicacioneModel.findByIdAndDelete(id).exec();
    if (!post) throw new NotFoundException('Publicación no encontrada');
    return post;
  }

  async addComment(postId: string, comment: { userName: string; userPhoto?: string; content: string; date?: Date }) {
    this.logger.log(`Agregando comentario al post ${postId}:`, JSON.stringify(comment));
    const post = await this.publicacioneModel.findById(postId).exec();
    if (!post) throw new NotFoundException('Publicación no encontrada');
    
    const newComment = { ...comment, date: comment.date || new Date() };
    post.comments.push(newComment);
    
    this.logger.log(`Comments antes de guardar:`, JSON.stringify(post.comments));
    const saved = await post.save();
    this.logger.log(`Comments después de guardar:`, JSON.stringify(saved.comments));
    this.logger.log(`Comentario creado en post ${postId} por ${comment.userName}`);
    
    return saved;
  }

  async like(postId: string, userId: string) {
    this.logger.log(`Agregando like al post ${postId} por usuario ${userId}`);
    const post = await this.publicacioneModel.findById(postId).exec();
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
    const post = await this.publicacioneModel.findById(postId).exec();
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
}
