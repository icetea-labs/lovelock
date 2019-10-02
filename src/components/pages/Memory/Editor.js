import React from 'react';
import Dante from 'Dante2';

export default function Editor(props) {
	
	return (
		<Dante
			content={props.initContent ? props.initContent : false}
			read_only={props.read_only ? true : false}
			onChange={(Editor) => {
				if (props.onChange) {
					props.onChange(Editor.save.editorContent)
				}
			}}
		/>
	);
}
