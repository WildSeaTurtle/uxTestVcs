import { ideIcons } from './ideIcons'

/** IDE activity indicator — `icons/Agents/Loader animated.svg` (rotating wrapper; asset is static vector). */
export function SnippetIdeActivitySpinner() {
  return (
    <span className="figma-ai-tw__snippetIconSpinner" aria-hidden>
      <span className="figma-ai-tw__snippetIconSpinnerImgWrap">
        <img
          className="figma-ai-tw__snippetIconSpinnerImg"
          src={ideIcons.loaderAnimated}
          alt=""
          width={16}
          height={16}
          decoding="async"
        />
      </span>
    </span>
  )
}
