import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Modal from '@material-ui/core/Modal';
import Button from '@material-ui/core/Button';

const useStyles = makeStyles(theme => ({
	paper: {
		position: 'absolute',
		width: 960,
		maxWidth: '100%',
		backgroundColor: theme.palette.background.paper,
		boxShadow: theme.shadows[5],
		padding: theme.spacing(3),
		left: '50%',
		top: 100,
		transform: 'translateX(-50%)',
		borderRadius: 3,
		outline: 'none',
	},
	title: {
		fontSize: 22,
		marginBottom: 30,
	},
	wrapper: {
		overflow: 'auto'
	},
	footer: {
		textAlign: 'right',
	},
	closeBtn: {
		marginLeft: 10,
	}
}));

export default function SimpleModal(props) {
	const classes = useStyles();
	return (
		<Modal
			aria-labelledby="simple-modal-title"
			aria-describedby="simple-modal-description"
			open={props.open}
			onClose={props.handleClose}
			className={classes.wrapper}
		>
			<div className={classes.paper}>
				<div className={classes.title}>{props.title}</div>
				{props.children}
				<div className={classes.footer}>
					{props.handleSumit &&
						<Button variant="contained" color="primary" onClick={props.handleSumit}>
							Publish
                        </Button>
					}
					<Button variant="contained" className={classes.closeBtn} onClick={props.handleClose}>
						Cancel
                    </Button>
				</div>
			</div>
		</Modal>
	);
}
