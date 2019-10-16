import React, { useEffect } from 'react';
import Dante from 'Dante2';
import { makeStyles } from '@material-ui/core/styles';
import mediumZoom from 'medium-zoom';

const useStyles = makeStyles(theme => ({
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
}))

export default function Editor(props) {
	const readonly = !!props.read_only
	const classes = useStyles();

	useEffect(() => {
		if (readonly) {
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
	});

	const configWidgets = () => {

		const ws = [...Dante.defaultProps.widgets]
		const imgBlock = ws[0]

		// remove the border when item is selected in view mode
		imgBlock.selected_class = readonly ? 'is-selected' : 'is-selected is-mediaFocused'

		return ws
	}

	return (
		<div className={classes.wrapper}>
			<Dante
				content={props.initContent ? props.initContent : null}
				read_only={readonly}
				widgets={configWidgets()}
				onChange={(Editor) => {
					Editor.relocateTooltips()
					if (props.onChange) {
						props.onChange(Editor.save.editorContent)
					}
				}}
			/>
		</div>
	)
}
