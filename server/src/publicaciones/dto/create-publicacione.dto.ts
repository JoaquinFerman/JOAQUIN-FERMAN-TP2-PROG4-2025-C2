export class CreatePublicacioneDto {
	// Fields provided by client
	title?: string;
	description?: string;
	content?: string;
	date?: Date;

	// Owner fields (set by server when creating) - keep optional for typing
	userId?: string;
	userName?: string;
	userPhoto?: string;
	isOwn?: boolean;
	imageUrl?: string;
}
