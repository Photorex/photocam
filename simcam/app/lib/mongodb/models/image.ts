import { Schema, model, models, Types } from "mongoose";

export interface ImageDocument {
    _id: string;
    createdAt: Date;
    updatedAt: Date;
    userId: Types.ObjectId;
    type_gen: string;
    model: string;
    steps: number;
    cfg: number;
    denoise: number;
    weights_interpretator: string;
    upscale: string;
    facelock_weight: number;
    facelock_type: string;
    pose_weight: number;
    inpaint_what: string;
    prompt: string;
    size: string;
    id_gen: Types.ObjectId;
    host_gen?: string;
    time_gen?: string;
    age?: string;
    gender?: string;
    ethnicity?: string;
    style: string;
    tool: string;
    pipeline: string;
    neg_prompt?: string;
    loras: string;
    res_image?: string;
    favorite?: boolean;
    cost?: number;
    user_shared_settings?: boolean;
    shared_gallery?: boolean;
    gallery_image_likes?: number;
    category?: string;
    status?: string;
}

const ImageSchema = new Schema<ImageDocument>({
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type_gen: { type: String, required: true },
    model: { type: String, required: true },
    steps: { type: Number, required: true },
    cfg: { type: Number, required: true },
    denoise: { type: Number, required: true },
    weights_interpretator: { type: String, required: true },
    upscale: { type: String, required: true },
    facelock_weight: { type: Number, required: true },
    facelock_type: { type: String, required: true },
    pose_weight: { type: Number, required: true },
    inpaint_what: { type: String, required: true },
    prompt: { type: String, required: true },
    size: { type: String, required: true },
    host_gen: { type: String, default: null },
    time_gen: { type: String, default: null },
    age: { type: String, default: null },
    gender: { type: String, default: null },
    ethnicity: { type: String, default: null },
    style: { type: String, required: true },
    tool: { type: String, required: true },
    pipeline: { type: String, required: true },
    neg_prompt: { type: String, default: null },
    loras: { type: String, required: true },
    res_image: { type: String, default: null },
    favorite:  { type: Boolean, default: false },
    cost: { type: Number, required: false },
    user_shared_settings:  { type: Boolean, default: false },
    shared_gallery:  { type: Boolean, default: false },
    gallery_image_likes:  { type: Number, default: 0 },
    category: { type: String, default: null },
    status: { type: String, default: null },
}, {
  timestamps: true
});

const Image = models.Image || model('Image', ImageSchema);

export default Image;