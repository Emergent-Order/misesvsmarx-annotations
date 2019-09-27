/**
 * External dependencies
 */

import classnames from 'classnames'
import Select from 'react-select'

/**
 * Internal dependencies
 */
import icon from '../icon'

/**
 * WordPress dependencies
 */
const WPAPI = require('wpapi')
const { __ } = wp.i18n;
const { Component, Fragment } = wp.element;
const { select, withSelect } = wp.data;
const { BlockControls } = wp.blockEditor;
const {
	applyFormat,
	removeFormat,
	getActiveFormat,
	toggleFormat
} = wp.richText

const {
	Toolbar,
	IconButton,
	Popover,
	ColorPalette,
	TextControl,
	Button,
	RadioControl,
	BaseControl,
} = wp.components
const { compose, ifCondition } = wp.compose
const { RichTextToolbarButton, RichTextShortcut } = wp.editor

const name = 'misesvsmarx/annotation'
const title = __( 'Annotation', 'misesvsmarx' )

const highlight = {
	type: 'misesvsmarx/highlight',
	attributes: {
		style: 'text-decoration: underline;',
		class: 'is-highlighted'
	}
}

const postData = {
	type: 'misesvsmarx/data',
	attributes: {
		postId: null
	}
}

class Edit extends Component {
	constructor() {
		super( ...arguments )

		const { isActive, value, onChange } = this.props
		console.log(this.props)

		this.toggle = this.toggle.bind(this)
		this.save = this.save.bind(this)
		this.getPosts = this.getPosts.bind(this)
		// this.toggleHighlight = this.toggleHighlight.bind(this)

		this.state = {
			isOpen: false,
			view: 'e',
			annotation: null,
			postId: null,
			title: '',
			content: '',
			url: '',
			posts: null
		}

		this.getPosts()
	}

	async getPosts() {
		const site = await WPAPI.discover(globals.siteUrl)
		site.annotations().perPage(100).get().then(posts => {
			const p = posts.map(post => {
				const title = htmlDecode(post.title.rendered)
				console.log(title)
				return {
					value: post.id.toString(),
					label: title
				}
			})

			console.log(posts)
			this.setState({
				posts: p
			})
		})
	}

	async save() {
		const site = await WPAPI.discover(globals.siteUrl)
		const { view, title, content, url, posts, postId } = this.state
		const { isActive, value, onChange } = this.props

		let annotation = {
			type: 'misesvsmarx/annotation',
			attributes: {
				url: ''
			}
		}

		if (view === 'e') {		// using existing annotation
			console.log(postId)
			annotation.attributes.url = postId
			onChange(
				applyFormat(value, annotation)
			)
		} else {
			site.annotations().create({
				title,
				content,
				status: 'publish'
			}).then(res => {
				console.log(res)
				// annotation.attributes.url = response.id

				onChange(
					applyFormat(value, annotation)
				)
			})
		}

		this.toggle()
	}

	toggle() {
		this.setState((state) => ({
			isOpen: ! state.isOpen,
		}))
	}

	render() {
		const {
			isOpen,
			url,
			title,
			content,
			annotations,
			posts,
			view,
		} = this.state

		const { value, onChange, isActive } = this.props;

		return (
			<Fragment>
				<BlockControls>
					<Toolbar className="misesvsmarx-components-toolbar">
						<IconButton
							className={ classnames(
								'components-button components-icon-button components-editorskit-toolbar__control components-toolbar__control components-editorskit-background-format', {
									'is-active': isActive,
								}
							) }
							icon={ icon.highlighter }
							aria-haspopup="true"
							tooltip={ title }
							onClick={ this.toggle }
						>
						</IconButton>
						{ isOpen && (
							<Popover
								position="bottom center"
								className="components-misesvsmarx-annotation"
								focusOnMount="container"
								onFocusOutside={null}
								headerTitle="Create an annotation"
							>
								<Fragment>
									<RadioControl
										label="Select source"
										id="radio-control"
										selected={view}
										options={[
											{ label: 'Existing Annotation', value: 'e' },
											{ label: 'Create New Annotation', value: 'a' }
										]}
										onChange={ (option) => {
											this.setState({
												view: option
											})
										}}
									/>
									{
										view === 'e' &&
										<BaseControl
											id="select-annotation"
											label="Select existing Annotation"
										>
											<Select
												id="select"
												className="block-editor-block-toolbar"
												options={posts}
												isSearchable={true}
												onChange={(e) => {
													console.log(e)
													this.setState({
														postId: e.value
													})
												}}
											/>
										</BaseControl>
									}
									{ view === 'a' &&
										<Fragment>
											<TextControl
												label="Title"
												value={ title }
												onChange={(val) => {
													this.setState({
														title: val
													})
												}}
											/>
											<TextControl
												label="Annotations URL"
												value={ url }
												onChange={(val) => {
													this.setState({
														url: val
													})
												}}
											/>
										</Fragment>
									}
									<Button isDefault onClick={ this.save }>
										Save
									</Button>
								</Fragment>
							</Popover>
						) }
					</Toolbar>
				</BlockControls>
			</Fragment>
		)
	}
}

function htmlDecode(input){
  var e = document.createElement('div');
  e.innerHTML = input;
  return e.childNodes.length === 0 ? "" : e.childNodes[0].nodeValue;
}

export default Edit
