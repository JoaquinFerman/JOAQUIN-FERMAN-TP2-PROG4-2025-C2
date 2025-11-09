import { Controller, Get, Post, Put, Body, Query, Param } from '@nestjs/common';
import { CommentsService } from 'src/comments/comments.service';
import { CreateCommentDto } from 'src/comments/dto/create-comment.dto';
import { UpdateCommentDto } from 'src/comments/dto/update-comment.dto';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get(':postId')
  async getComments(
    @Param('postId') postId: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    const comments = await this.commentsService.getComments(postId, page, limit);
    return { message: 'Comments fetched successfully', comments };
  }

  @Post()
  async addComment(@Body() createCommentDto: CreateCommentDto) {
    const comment = await this.commentsService.addComment(createCommentDto);
    return { message: 'Comment added successfully', comment };
  }

  @Put(':commentId')
  async updateComment(
    @Param('commentId') commentId: string,
    @Body() updateCommentDto: UpdateCommentDto,
  ) {
    const updatedComment = await this.commentsService.updateComment(commentId, updateCommentDto);
    return { message: 'Comment updated successfully', updatedComment };
  }
}