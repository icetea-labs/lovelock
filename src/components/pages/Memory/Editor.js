import React, { useEffect } from 'react';
import Dante from 'Dante2';
import { makeStyles } from '@material-ui/core/styles';

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
	const classes = useStyles();

	useEffect(() => {
		let [input] = document.getElementsByClassName('public-DraftEditor-content')
		if (input) input.focus()
	});

	return (
		<div className={classes.wrapper}>
			<Dante
				content={props.initContent ? props.initContent : false}
				read_only={props.read_only ? true : false}
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
