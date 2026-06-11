import {useState} from 'react'
import type {UserViewComponent} from 'sanity/structure'

/**
 * "Preview" tab on blog documents: renders the site's SSR draft-preview route
 * (/preview/blog/<slug>?secret=…) in an iframe, showing the current DRAFT
 * state. The Reload button re-fetches after edits (drafts save automatically,
 * so reload = see your latest changes).
 *
 * Configure via studio/.env (baked in at `sanity deploy` time):
 *   SANITY_STUDIO_PREVIEW_ORIGIN — site origin (defaults to staging)
 *   SANITY_STUDIO_PREVIEW_SECRET — must match the site's PREVIEW_SECRET env
 */
const ORIGIN = process.env.SANITY_STUDIO_PREVIEW_ORIGIN || 'https://saganpassportstaging.netlify.app'
const SECRET = process.env.SANITY_STUDIO_PREVIEW_SECRET || ''

const wrap: React.CSSProperties = {display: 'flex', flexDirection: 'column', height: '100%'}
const bar: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: '6px 10px',
  borderBottom: '1px solid #e3e4e8',
  fontSize: 12,
}
const msg: React.CSSProperties = {padding: 24, fontSize: 13, lineHeight: 1.5}

export const PreviewPane: UserViewComponent = ({document}) => {
  const [gen, setGen] = useState(0)
  const slug = (document.displayed as {slug?: {current?: string}} | undefined)?.slug?.current

  if (!SECRET) {
    return (
      <div style={msg}>
        Preview is not configured: set <code>SANITY_STUDIO_PREVIEW_SECRET</code> in studio/.env and
        redeploy the Studio.
      </div>
    )
  }
  if (!slug) {
    return <div style={msg}>Set a slug (Meta tab) to enable the preview.</div>
  }

  const src = `${ORIGIN}/preview/blog/${slug}?secret=${encodeURIComponent(SECRET)}`
  return (
    <div style={wrap}>
      <div style={bar}>
        <button type="button" onClick={() => setGen((g) => g + 1)} style={{cursor: 'pointer'}}>
          ↻ Reload
        </button>
        <span style={{color: '#6e7683'}}>Draft preview — reload after editing to see changes.</span>
        <a href={src} target="_blank" rel="noreferrer" style={{marginLeft: 'auto'}}>
          Open in new tab ↗
        </a>
      </div>
      <iframe
        key={gen}
        src={src}
        style={{flex: 1, width: '100%', border: 0}}
        title="Draft preview"
      />
    </div>
  )
}
