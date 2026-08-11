import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                disallow: [
                    "/api/",
                    "/super-admin/",
                    "/eviko/",
                    "/eviko/",
                    "/kassa/",
                    "/agent-portal/",
                ],
            },
        ],
        sitemap: "https://eviko.e-code.uz/sitemap.xml",
    };
}
