import React from 'react';
import Dante from "Dante2";

export default function Editor(props) {

	return (
		<Dante
			data_storage={{
				save_handler: (editorContext, content) => {
					console.log(editorContext, content)
					if (props.onChange) {
						props.onChange(content)
					}
				},
				url: 'null'
			}}
			content={props.initContent ? props.initContent : false}
			read_only={props.read_only ? true : false}
		/>
	);
}
