import type { MetadataRoute } from "next";
import { COURSES_INDEX } from "@/lib/deep-courses/index-meta";
import { SITE_URL } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/jobs",
    "/tools",
    "/pricing",
    "/pricing-tool",
    "/cover-letter",
    "/resume",
    "/tracker",
    "/interview-prep",
    "/follow-up-email",
    "/learn",
    "/learn/start",
    "/courses",
    "/about",
    "/help",
    "/privacy",
    "/terms",
  ].map((path) => ({
    url: `${SITE_URL}${path || "/"}`,
    lastModified: now,
    changeFrequency: path === "/jobs" ? "hourly" : path === "" ? "weekly" : "monthly",
    priority: path === "" || path === "/jobs" ? 1 : path === "/courses" ? 0.9 : 0.7,
  }));

  const courses = COURSES_INDEX.cards.map((card) => ({
    url: `${SITE_URL}/courses/${card.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [...staticRoutes, ...courses];
}
