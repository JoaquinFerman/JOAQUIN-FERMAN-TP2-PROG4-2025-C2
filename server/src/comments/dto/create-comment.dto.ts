export class CreateCommentDto {
  readonly postId: string;
  readonly author: string;
  readonly content: string;
}