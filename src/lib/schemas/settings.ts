import { z } from 'zod';

export const StatsSettingsSchema = z.object({
  members:  z.string().max(120).optional(),
  programs: z.string().max(120).optional(),
  sections: z.string().max(120).optional(),
});
export type StatsSettings = z.infer<typeof StatsSettingsSchema>;

export const ContactSettingsSchema = z.object({
  email:     z.string().max(120).optional(),
  linkedin:  z.string().max(300).refine(
    v => v === '' || /^https?:\/\//i.test(v),
    { message: 'URL måste börja med https://' }
  ).optional().or(z.literal('')),
  instagram: z.string().max(300).refine(
    v => v === '' || /^https?:\/\//i.test(v),
    { message: 'URL måste börja med https://' }
  ).optional().or(z.literal('')),
  address:   z.string().max(300).optional(),
});
export type ContactSettings = z.infer<typeof ContactSettingsSchema>;

export const AboutSettingsSchema = z.object({
  whatIsP1Sv: z.string().max(2000).optional(),
  whatIsP1En: z.string().max(2000).optional(),
  whatIsP2Sv: z.string().max(2000).optional(),
  whatIsP2En: z.string().max(2000).optional(),
  whatIsP3Sv: z.string().max(2000).optional(),
  whatIsP3En: z.string().max(2000).optional(),
  footerDescSv: z.string().max(2000).optional(),
  footerDescEn: z.string().max(2000).optional(),
});
export type AboutSettings = z.infer<typeof AboutSettingsSchema>;

export const ServicesSettingsSchema = z.object({
  eventsTitleSv:      z.string().max(120).optional(),
  eventsTitleEn:      z.string().max(120).optional(),
  eventsDescSv:       z.string().max(2000).optional(),
  eventsDescEn:       z.string().max(2000).optional(),
  portalTitleSv:      z.string().max(120).optional(),
  portalTitleEn:      z.string().max(120).optional(),
  portalDescSv:       z.string().max(2000).optional(),
  portalDescEn:       z.string().max(2000).optional(),
  partnershipTitleSv: z.string().max(120).optional(),
  partnershipTitleEn: z.string().max(120).optional(),
  partnershipDescSv:  z.string().max(2000).optional(),
  partnershipDescEn:  z.string().max(2000).optional(),
});
export type ServicesSettings = z.infer<typeof ServicesSettingsSchema>;

export const SectionLinkSchema = z.object({
  name: z.string().max(120),
  href: z.string().url().max(300).refine(
    v => /^https?:\/\//i.test(v),
    { message: 'URL måste börja med https://' }
  ),
});
export type SectionLink = z.infer<typeof SectionLinkSchema>;

export const LinksSettingsSchema = z.object({
  teknologkaren: z.string().max(300).refine(
    v => v === '' || /^https?:\/\//i.test(v),
    { message: 'URL måste börja med https://' }
  ).optional().or(z.literal('')),
  larv: z.string().max(300).refine(
    v => v === '' || /^https?:\/\//i.test(v),
    { message: 'URL måste börja med https://' }
  ).optional().or(z.literal('')),
  sectionLinks:  z.array(SectionLinkSchema).max(4).optional(),
});
export type LinksSettings = z.infer<typeof LinksSettingsSchema>;

export const BannerSettingsSchema = z.object({
  active: z.boolean().optional(),
  text:   z.string().max(300).optional(),
  color:  z.string().max(30).regex(/^#[0-9a-fA-F]{3,8}$/, { message: 'Ogiltigt färgformat' }).optional(),
});
export type BannerSettings = z.infer<typeof BannerSettingsSchema>;

export const TimelineItemDataSchema = z.object({
  year:    z.string().max(120),
  titleSv: z.string().max(120),
  titleEn: z.string().max(120),
  descSv:  z.string().max(2000),
  descEn:  z.string().max(2000),
  order:   z.number().int(),
});
export type TimelineItemData = z.infer<typeof TimelineItemDataSchema>;

export const TimelineItemSchema = TimelineItemDataSchema.extend({
  id: z.string(),
});
export type TimelineItem = z.infer<typeof TimelineItemSchema>;
