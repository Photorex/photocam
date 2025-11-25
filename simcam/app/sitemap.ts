import { MetadataRoute } from 'next'
 
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return [
    {
      url: `${process.env.NEXT_PUBLIC_BASE_URL}/`,
    //   lastModified: ,
    //   changeFrequency: ,
    //   priority: ,
    },
    {
        url: `${process.env.NEXT_PUBLIC_BASE_URL}/pricing`,
    },
    {
        url: `${process.env.NEXT_PUBLIC_BASE_URL}/faq`,
    },
  ]
}