/**
 * FORMAT: annotations
 *
 */

//  Import CSS.
import './editor.scss'
import './style.scss'

/**
 * Internal dependencies
 */
import Edit from './components/edit'

/**
 * WordPress dependencies
 */
const { __ } = wp.i18n
const { registerFormatType } = wp.richText

/**
 * Block constants
 */
const name = 'misesvsmarx/annotation'

export const annotation = {
	name,
	title: __( 'Annotation', 'misesvsmarx' ),
	tagName: 'a',
	className: 'mvm-has-annotation',
	attributes: {
		style: 'style',
		className: 'class',
		url: 'data-post-id'
	},
	edit: Edit,
}

registerFormatType(annotation.name, annotation)
