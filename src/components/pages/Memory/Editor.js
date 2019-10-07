import React from 'react';
import Dante from 'Dante2';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
	wrapper: {
		margin: '0 auto',
		maxWidth: 740
	}
}));

export default function Editor(props) {
	const classes = useStyles();
	
	return (
		<div className={classes.wrapper}>
			<Dante
				content={props.initContent ? props.initContent : false}
				read_only={props.read_only ? true : false}
				onChange={(Editor) => {
					if (props.onChange) {
						props.onChange(Editor.save.editorContent)
					}
				}}
			/>
		</div>
	);
}
