import { Injectable } from '@nestjs/common';
import { CreateCommentDto } from 'src/comments/dto/create-comment.dto';
import { UpdateCommentDto } from 'src/comments/dto/update-comment.dto';

@Injectable()
export class CommentsService {
  async getComments(postId: string, page: number, limit: number) {
    const comments = [
      // Mock data for comments
      { id: '1', content: 'First comment', postId, createdAt: new Date() },
      { id: '2', content: 'Second comment', postId, createdAt: new Date() },
    ];
    // Logic to fetch comments from the database with pagination
    return comments.slice((page - 1) * limit, page * limit);
  }

  async addComment(createCommentDto: CreateCommentDto) {
    const newComment = {
      ...createCommentDto,
      createdAt: new Date(),
    };
    // Logic to save the comment in the database
    return newComment;
  }

  async updateComment(commentId: string, updateCommentDto: UpdateCommentDto) {
    const updatedComment = {
      ...updateCommentDto,
      modified: true,
      updatedAt: new Date(),
    };
    // Logic to update the comment in the database
    return updatedComment;
  }
}