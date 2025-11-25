import modelImg_Photorealism from '@/public/assets/models/Photorealism.png';
import modelImg_animagineXL_v31 from '@/public/assets/models/animagineXL_v31.jpeg';
import modelImg_animexl from '@/public/assets/models/animexl.jpeg';
import modelImg_AnythingXL_xl from '@/public/assets/models/AnythingXL_xl.jpeg';
import modelImg_copaxtimeless from '@/public/assets/models/copaxTimeless.jpeg';
import modelImg_counterfeitxl_v25 from '@/public/assets/models/counterfeitxl_v25.jpeg';
import modelImg_CrystalClearXL from '@/public/assets/models/Crystal Clear XL.jpeg';
import modelImg_dreamshaperXL_v21 from '@/public/assets/models/dreamshaperXL_v21.jpeg';
import modelImg_dynavisionXLA from '@/public/assets/models/dynavisionXLA.jpeg';
import modelImg_hassakuXLV06 from '@/public/assets/models/hassakuXLV06.jpeg';
import modelImg_infinianimeXL_v16 from '@/public/assets/models/infinianimexl_v16.jpeg';
import modelImg_jibMix from '@/public/assets/models/jibMix.jpeg';
import modelImg_leosamsXL_70 from '@/public/assets/models/leosamsXL_70.jpeg';
import modelImg_mkIanRealistic from '@/public/assets/models/mklanRealistic.jpeg';
import modelImg_MysteriousSDXL from '@/public/assets/models/MysteriousSDXL.jpeg';
import modelImg_NewrealityXL_v40 from '@/public/assets/models/Newrealityxl_XL40.jpeg';
import modelImg_Nijijstyle from '@/public/assets/models/Nijistyle.jpeg';
import modelImg_photoVisionXL_v10 from '@/public/assets/models/photoVisionXL_v10.jpeg';
import modelImg_realcartoonXL_v6 from '@/public/assets/models/realcartoonXL_v6.jpeg';
import modelImg_realDream_sdx1 from '@/public/assets/models/realDream_sdxl1.jpeg';
import modelImg_realvisXL_v40 from '@/public/assets/models/realvisxlV40.jpeg';
import modelImg_reproductionSDXL_2v12 from '@/public/assets/models/reproductionSDXL_2v12.jpeg';
import modelImg_samaritan3dCartoon from '@/public/assets/models/samaritan3dCartoon.jpeg';
import modelImg_sdXL from '@/public/assets/models/sdXL.jpeg';
import modelImg_sdXLNuclear from '@/public/assets/models/sdxlNuclear.jpeg';
import modelImg_sdXLYamersAnime from '@/public/assets/models/sdxlYamersAnime.jpeg';
import modelImg_starlightXL from '@/public/assets/models/starlightXL.jpeg';
import modelImg_thinkdiffusionXL_v10 from '@/public/assets/models/thinkdiffusionxl_v10.jpeg';
import modelImg_wildcardxXL from '@/public/assets/models/wildcardxXL.jpeg';
import modelImg_wildcardxXLAnimation from '@/public/assets/models/wildcardxXLANIMATION.jpeg';
import modelImg_YamersRealisticv5 from '@/public/assets/models/YamersRealisticv5.jpeg';

interface ModelData {
    name: string;
    category: string;
    image: string;
    apiName: string;
    modelFacelockType: string;
}

  
const modelData: ModelData[] = [
    { name: "Photorealism", category: "Photorealistic", image: modelImg_Photorealism.src, apiName: "realism", modelFacelockType: "faceswap" },
	{ name: "AnimagineXL v3.1", category: "Anime", image: modelImg_animagineXL_v31.src, apiName: "animagineXL_v31", modelFacelockType: "faceswap" },
	{ name: "Animexl", category: "Anime", image: modelImg_animexl.src, apiName: "animexl", modelFacelockType: "full" },
	{ name: "AnythingXL xl", category: "Anime", image: modelImg_AnythingXL_xl.src, apiName: "AnythingXL_xl", modelFacelockType: "full" },
	{ name: "Copax Timeless", category: "Photorealistic", image: modelImg_copaxtimeless.src, apiName: "copaxTimeless", modelFacelockType: "faceswap" },
	{ name: "CounterfeitXL v25", category: "Anime", image: modelImg_counterfeitxl_v25.src, apiName: "counterfeitxl_v25", modelFacelockType: "full" },
	{ name: "Crystal Clear XL", category: "Design", image: modelImg_CrystalClearXL.src, apiName: "crystalClearXL_ccxl", modelFacelockType: "faceswap" },
	// { name: "DreamshaperXL v21", image: modelImg_dreamshaperXL_v21.src, apiName: "dreamshaperXL_v21", modelFacelockType: "faceswap" },
	{ name: "DynavisionXLA", category: "Cartoon", image: modelImg_dynavisionXLA.src, apiName: "dynavisionXLA", modelFacelockType: "faceswap" },
	{ name: "HassakuXL V06", category: "Anime", image: modelImg_hassakuXLV06.src, apiName: "hassakuXLV06", modelFacelockType: "full" },
	{ name: "InfinianimeXL v16", category: "Anime", image: modelImg_infinianimeXL_v16.src, apiName: "infinianimexl_v16", modelFacelockType: "full" },
	{ name: "JibMix", category: "Design", image: modelImg_jibMix.src, apiName: "jibMix", modelFacelockType: "faceswap" },
	{ name: "LeosamsXL 70", category: "Epic", image: modelImg_leosamsXL_70.src, apiName: "leosamsXL_70", modelFacelockType: "faceswap" },
	{ name: "MkIan Realistic", category: "Photorealistic", image: modelImg_mkIanRealistic.src, apiName: "mklanRealistic", modelFacelockType: "faceswap" },
	{ name: "MysteriousSDXL", category: "Epic", image: modelImg_MysteriousSDXL.src, apiName: "MysteriousSDXL", modelFacelockType: "faceswap" },
	{ name: "NewrealityXL v40", category: "Epic", image: modelImg_NewrealityXL_v40.src, apiName: "Newrealityxl_XL40", modelFacelockType: "faceswap" },
	{ name: "Nijijstyle", category: "Anime", image: modelImg_Nijijstyle.src, apiName: "Nijistyle", modelFacelockType: "faceswap" },
	{ name: "PhotoVisionXL v10", category: "Photorealistic", image: modelImg_photoVisionXL_v10.src, apiName: "photoVisionXL_v10", modelFacelockType: "faceswap" },
	{ name: "RealCartoonXL v6", category: "Epic", image: modelImg_realcartoonXL_v6.src, apiName: "realcartoonXL_v6", modelFacelockType: "faceswap" },
	{ name: "RealDream sdx1", category: "Epic", image: modelImg_realDream_sdx1.src, apiName: "realDream_sdxl1", modelFacelockType: "faceswap" },
	{ name: "RealvisXL v40", category: "Photorealistic", image: modelImg_realvisXL_v40.src, apiName: "realvisxlV40", modelFacelockType: "faceswap" },
	{ name: "ReproductionSDXL 2v12", category: "Anime", image: modelImg_reproductionSDXL_2v12.src, apiName: "reproductionSDXL_2v12", modelFacelockType: "full" },
	{ name: "Samaritan3dCartoon", category: "Cartoon", image: modelImg_samaritan3dCartoon.src, apiName: "samaritan3dCartoon", modelFacelockType: "faceswap" },
	{ name: "SdXL", category: "Photorealistic", image: modelImg_sdXL.src, apiName: "sdXL", modelFacelockType: "faceswap" },
	{ name: "SdXLNuclear", category: "Design", image: modelImg_sdXLNuclear.src, apiName: "sdxlNuclear", modelFacelockType: "faceswap" },
	{ name: "SdXLYamersAnime", category: "Anime", image: modelImg_sdXLYamersAnime.src, apiName: "sdxlYamersAnime", modelFacelockType: "faceswap" },
	{ name: "StarlightXL", category: "Epic", image: modelImg_starlightXL.src, apiName: "starlightXL_v3", modelFacelockType: "faceswap" },
	{ name: "ThinkdiffusionXL v10", category: "Photorealistic", image: modelImg_thinkdiffusionXL_v10.src, apiName: "thinkdiffusionxl_v10", modelFacelockType: "faceswap" },
	{ name: "WildcardxXL", category: "Epic", image: modelImg_wildcardxXL.src, apiName: "wildcardxXL", modelFacelockType: "faceswap" },
	{ name: "WildcardxXLAnimation", category: "Cartoon", image: modelImg_wildcardxXLAnimation.src, apiName: "wildcardxXLANIMATION", modelFacelockType: "faceswap" },
	{ name: "YamersRealisticv5", category: "Photorealistic", image: modelImg_YamersRealisticv5.src, apiName: "YamersRealisticv5", modelFacelockType: "faceswap" }
];
  
export default modelData;