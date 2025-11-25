import { Schema, model, models, Types } from "mongoose";

export interface VideoDocument {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
  userId: Types.ObjectId;
  type_gen: string;
  prompt?: string;
  resolution: string;
  favorite?: boolean;
  image_prompt?: string;
  scene?: string;
  version?: string;
  gender?: string;
  loras?: string;
  res_video?: string; // ← for saved result path
  user_shared_settings?: boolean;
  shared_gallery?: boolean;
  status?: string;
}

const VideoSchema = new Schema<VideoDocument>({
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type_gen: { type: String, required: true },
  prompt: { type: String, default: null },
  resolution: { type: String, required: true },
  favorite: { type: Boolean, default: false },
  image_prompt: { type: String, default: null },
  scene: { type: String, default: null },
  version: { type: String, default: null },
  gender: { type: String, default: null },
  loras: { type: String, default: null },
  res_video: { type: String, default: null },
  user_shared_settings: { type: Boolean, default: false },
  shared_gallery: { type: Boolean, default: false },
  status: { type: String, default: "generating" }
}, {
  timestamps: true
});

const Video = models.Video || model('Video', VideoSchema);

export default Video;