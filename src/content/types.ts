export interface Link {
  readonly label: string
  readonly href: string
}

export interface SectionHeadingContent {
  readonly eyebrow: string
  readonly line1: string
  readonly line2: string
}

export interface NavItemContent {
  readonly id: string
  readonly label: string
}

export interface Meta {
  readonly title: string
  readonly description: string
}

export interface TerminalContent {
  readonly title: string
  readonly command: string
  readonly lines: readonly string[]
}

export interface Hero {
  readonly eyebrow: string
  readonly line1: string
  readonly line2: string
  readonly summary: string
  readonly primaryCta: string
  readonly secondaryCta: string
  readonly portraitAlt: string
  readonly terminal: TerminalContent
}

export interface About {
  readonly heading: SectionHeadingContent
  readonly paragraphs: readonly string[]
  readonly lookingFor: {
    readonly title: string
    readonly items: readonly string[]
  }
  readonly facts: readonly { readonly label: string; readonly value: string }[]
}

export interface Contribution {
  readonly project: string
  readonly driver?: string
  readonly language: string
  readonly title: string
  /** The bug explained to a non-programmer, one sentence. */
  readonly plain: string
  /** The technical detail, one sentence. */
  readonly technical: string
  readonly status: string
  readonly links: readonly Link[]
}

export interface OpenSource {
  readonly heading: SectionHeadingContent
  readonly intro: string
  readonly plainLabel: string
  readonly technicalLabel: string
  readonly contributions: readonly Contribution[]
}

export interface TimelineEntry {
  readonly period: string
  readonly role: string
  readonly org: string
  readonly place?: string
  readonly bullets: readonly string[]
}

export interface Experience {
  readonly heading: SectionHeadingContent
  readonly entries: readonly TimelineEntry[]
}

export type DiscPattern = 'rings' | 'grid' | 'dots' | 'waves' | 'bars'

export interface DiscPalette {
  readonly from: string
  readonly to: string
  readonly accent: string
}

export interface Project {
  readonly title: string
  readonly tagline: string
  readonly stack: readonly string[]
  readonly bullets: readonly string[]
  readonly href?: string
  readonly pattern?: DiscPattern
  readonly palette?: DiscPalette
}

export interface Projects {
  readonly heading: SectionHeadingContent
  readonly projects: readonly Project[]
  readonly viewProject: string
  readonly labels: ProjectsLabels
}

export interface ProjectsLabels {
  readonly stack: string
  readonly summary: string
  readonly viewRepository: string
  readonly indexLabel: string
  readonly hint: string
  readonly carouselAria: string
  readonly navAria: string
  readonly prev: string
  readonly next: string
  /** Template; {i}, {n} and {title} are replaced by the carousel. */
  readonly slideOf: string
  /** Template; {i}, {n} and {title} are replaced by the carousel. */
  readonly live: string
}

export interface StackItem {
  readonly name: string
  /** simple-icons slug when the technology has a logo there. */
  readonly slug?: string
}

export interface StackGroup {
  readonly group: string
  readonly items: readonly StackItem[]
}

export interface Stack {
  readonly heading: SectionHeadingContent
  readonly groups: readonly StackGroup[]
}

export interface Certification {
  readonly code: string
  readonly name: string
  readonly issuer: string
  readonly year: string
}

export interface Certifications {
  readonly title: string
  readonly items: readonly Certification[]
}

export interface Contact {
  readonly heading: SectionHeadingContent
  readonly intro: string
  readonly email: string
  readonly github: string
  readonly linkedin: string
  readonly cv: { readonly es: string; readonly en: string }
}

export interface Footer {
  readonly text: string
}

export interface UiLabels {
  readonly navAria: string
  readonly languageAria: string
  readonly languageNames: { readonly es: string; readonly en: string }
  readonly openMenu: string
  readonly closeMenu: string
  readonly socialAria: string
  readonly github: string
  readonly linkedin: string
  readonly email: string
  readonly resume: string
  readonly downloadCv: string
  readonly downloadCvEs: string
  readonly downloadCvEn: string
  readonly viewWork: string
  readonly copyEmail: string
  readonly copied: string
  readonly openExternal: string
}

export interface SiteContent {
  readonly meta: Meta
  readonly nav: readonly NavItemContent[]
  readonly hero: Hero
  readonly about: About
  readonly openSource: OpenSource
  readonly experience: Experience
  readonly projects: Projects
  readonly stack: Stack
  readonly certifications: Certifications
  readonly contact: Contact
  readonly footer: Footer
  readonly ui: UiLabels
}
