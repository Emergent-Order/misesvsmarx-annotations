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
	ExternalLink,
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

console.log(globals)

async function initializeSite() {
	return WPAPI.discover(globals.siteUrl).then(site => {
		return site.auth({
			endpoint: globals.root,
			nonce: globals.nonce
		})
	})
}

class Edit extends Component {
	constructor() {
		super( ...arguments )

		const { isActive, value, onChange } = this.props
		console.log(this.props)

		this.toggle = this.toggle.bind(this)
		this.save = this.save.bind(this)
		this.getPosts = this.getPosts.bind(this)
		this.getEditLink = this.getEditLink.bind(this)

		const current = value.activeAttributes ? value.activeAttributes.url : null

		this.state = {
			isOpen: false,
			view: 'e',
			annotation: null,
			postId: current,
			title: '',
			content: '',
			url: '',
			posts: null
		}

		this.getPosts()
	}

	async getPosts() {
		const site = await initializeSite()
		site.annotations().perPage(100).get().then(posts => {
			const p = posts.map(post => {
				const title = htmlDecode(post.title.rendered)
				return {
					value: post.id.toString(),
					label: title
				}
			})

			this.setState({
				posts: p
			})
		})
	}

	async save() {
		const site = await initializeSite()
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

			this.toggle()
		} else {
			site.annotations().create({
				title,
				content,
				status: 'publish'
			}).then(res => {
				console.log(res)
				annotation.attributes.url = res.id.toString()

				onChange(
					applyFormat(value, annotation)
				)

				this.toggle()
			})
		}
	}

	toggle() {
		const { isOpen } = this.state
		const { value } = this.props

		// If we're opening the layer, set correct current data
		if (!isOpen) {
			this.getPosts()
			const currentFormat = getActiveFormat(value, 'misesvsmarx/annotation')
			if (currentFormat) {
				this.setState({
					view: 'e',
					postId: currentFormat.attributes.url
				})
			}
		}

		this.setState((state) => ({
			isOpen: ! state.isOpen,
		}))
	}

	getEditLink(current) {
		// console.log(current)
		// const site = await initializeSite()
		// const post = await site.annotations().id(current.value)
		// console.log('post', post)

		return `${globals.siteUrl}/wp-admin/post.php?post=${current.value}&action=edit`
	}

	render() {
		const {
			isOpen,
			url,
			title,
			content,
			postId,
			posts,
			view,
		} = this.state

		const { value, onChange, isActive } = this.props;
		const currentPost = posts ? posts.filter(post => post.value === postId)[0] : null
		const currentPostEditLink = currentPost ? this.getEditLink(currentPost) : null
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
												className="block-editor-block-toolbar remove-bebt-formatting"
												options={posts}
												isSearchable={true}
												defaultValue={currentPost}
												onChange={(e) => {
													console.log(e)
													this.setState({
														postId: e.value
													})
												}}
											/>
											<ExternalLink id="edit-link" href={currentPostEditLink}>
												Edit Annotation
											</ExternalLink>
										</BaseControl>
									}
									{ view === 'a' &&
										<Fragment>
											<TextControl
												label="Title"
												value={ title }
												className="block-editor-block-toolbar remove-bebt-formatting"
												onChange={(val) => {
													this.setState({
														title: val
													})
												}}
											/>
											<TextControl
												label="Annotations URL"
												className="block-editor-block-toolbar remove-bebt-formatting"
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
