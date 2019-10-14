import React from 'react';
import Dante from 'Dante2';
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
	wrapper: {
		margin: '0 auto',
		maxWidth: 740
	}
});

class Editor extends React.Component {

	componentDidMount() {
		let [input] = document.getElementsByClassName('public-DraftEditor-content')
		if (input) input.focus()
	}

	render() {
		const { classes } = this.props;
		return (
			<div className={classes.wrapper}>
				<Dante
					content={this.props.initContent ? this.props.initContent : false}
					read_only={this.props.read_only ? true : false}
					onChange={(Editor) => {
						if (this.props.onChange) {
							this.props.onChange(Editor.save.editorContent)
						}
					}}
				/>
			</div>
		);
	}
}

export default withStyles(styles)(Editor);