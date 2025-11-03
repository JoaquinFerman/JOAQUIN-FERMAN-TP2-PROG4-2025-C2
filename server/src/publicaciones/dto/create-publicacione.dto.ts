export class CreatePublicacioneDto {
	// The server will set userId, userName and userPhoto from the authenticated user.
	content: string;
	date?: Date;
}
