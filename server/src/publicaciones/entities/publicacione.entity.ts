import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PublicacioneDocument = Publicacione & Document;

@Schema({ _id: false })
export class Comment {
	@Prop({ required: true })
	userName: string;

	@Prop()
	userPhoto?: string;

	@Prop({ required: true })
	content: string;

	@Prop({ default: Date.now })
	date: Date;

	@Prop({ default: false })
	modified: boolean;

	@Prop()
	modifiedAt?: Date;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);

@Schema({ timestamps: true, collection: 'publicaciones' })
export class Publicacione {

    @Prop({ required: true })
    userId: string;

	@Prop({ required: true })
	userName: string;

	@Prop()
	userPhoto?: string;

	@Prop()
	title?: string;

	@Prop()
	description?: string;

	@Prop({ required: true })
	content: string;

	@Prop({ default: Date.now })
	date: Date;

	@Prop({ default: false })
	deleted: boolean;

	@Prop()
	deletedAt?: Date;

	@Prop({ default: false })
	isOwn: boolean;

	@Prop({ default: false })
	liked: boolean;

	@Prop()
	imageUrl?: string;

	@Prop({ type: [String], default: [] })
	likedUsers: string[];

	@Prop({ default: 0 })
	likesCount: number;

	@Prop({ type: [CommentSchema], default: [] })
	comments: Comment[];
}

export const PublicacioneSchema = SchemaFactory.createForClass(Publicacione);
