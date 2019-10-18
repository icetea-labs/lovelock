import React, { useEffect } from 'react';
import Dante from 'Dante2';
import { withStyles } from '@material-ui/core/styles';
import mediumZoom from 'medium-zoom';

const styles = {
	wrapper: {
		margin: '0 auto',
		maxWidth: 740,
		'@media screen and (max-width: 1200px)': {
			width: '52%'
		},
		'@media screen and (max-width: 850px)': {
			width: '43%'
		},
		'@media screen and (max-width: 700px)': {
			width: '100%'
		}
	}
}

class Editor extends React.Component {
	readonly = !!this.props.read_only

	componentDidMount() {
		if (this.readonly) {
			setTimeout(() => {
				const images = document.querySelectorAll('.graf-image')
				if (images.length) {
					mediumZoom(images)
				}
			}, 500)
		} else {
			let [input] = document.getElementsByClassName('public-DraftEditor-content')
			if (input) input.focus()
		}
	}

	configWidgets = () => {
		const ws = [...Dante.defaultProps.widgets]
		const imgBlock = ws[0]

		// remove the border when item is selected in view mode
		imgBlock.selected_class = this.readonly ? 'is-selected' : 'is-selected is-mediaFocused'

		return ws
	}

	render() {
		const { classes } = this.props;
		return (
			<div className={classes.wrapper}>
				<Dante
					content={this.props.initContent ? this.props.initContent : false}
					read_only={this.props.read_only ? true : false}
					widgets={this.configWidgets()}
					onChange={(Editor) => {
						Editor.relocateTooltips()
						if (this.props.onChange) {
							this.props.onChange(Editor.save.editorContent)
						}
					}}
				/>
			</div>
		)
	}
}

export default withStyles(styles)(Editor);