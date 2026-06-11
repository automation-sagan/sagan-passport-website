import type {DocumentActionComponent} from 'sanity'

/**
 * "Open preview" document action for blog posts — appears in the action menu
 * next to Publish and opens the site's draft-preview route in a new browser
 * tab. Same URL the in-Studio Preview tab uses (see PreviewPane.tsx).
 */
const ORIGIN = process.env.SANITY_STUDIO_PREVIEW_ORIGIN || 'https://saganpassportstaging.netlify.app'
const SECRET = process.env.SANITY_STUDIO_PREVIEW_SECRET || ''

export const openPreviewAction: DocumentActionComponent = (props) => {
  const doc = (props.draft ?? props.published) as {slug?: {current?: string}} | null
  const slug = doc?.slug?.current

  return {
    label: 'Open preview ↗',
    title: !SECRET
      ? 'Preview is not configured (SANITY_STUDIO_PREVIEW_SECRET missing)'
      : slug
        ? 'Open the draft preview in a new tab'
        : 'Set a slug (Meta tab) first',
    disabled: !slug || !SECRET,
    onHandle: () => {
      window.open(
        `${ORIGIN}/preview/blog/${slug}?secret=${encodeURIComponent(SECRET)}`,
        '_blank',
        'noopener',
      )
      props.onComplete()
    },
  }
}
