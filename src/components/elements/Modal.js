import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';

const useStyles = makeStyles(theme => ({
	paper: {
		position: 'absolute',
		maxWidth: '100%',
		minHeight: '100vh',
		backgroundColor: theme.palette.background.paper,
		boxShadow: theme.shadows[5],
		boxSizing: 'border-box',
		padding: '32px 3.6% 80px',
		left: 0,
		top: 0,
		width: '100%',
		outline: 'none',
	},
	title: {
		fontSize: 22,
		marginBottom: 30,
		color: '#616161',
	},
	wrapper: {
		overflow: 'auto',
		zIndex: '1000',
		position: 'fixed',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
	},
	footer: {
		textAlign: 'right',
		position: 'absolute',
		bottom: 30,
		right: 100,
	},
	closeBtn: {
		marginLeft: 10,
	},
	closeIcon: {
		position: 'absolute',
		right: '7%',
		top: 24,
		cursor: 'pointer',
		fontSize: 40,
	},
	subtitle: {
		marginTop: -15,
		marginBottom: 50,
		fontSize: '0.8em',
		opacity: 0.5,
	}
}));

export default function SimpleModal(props) {
	const classes = useStyles();

	if (props.open) {
		document.body.style.overflow = 'hidden'
	} else {
		document.body.style.overflow = 'auto'
		return null
	}

	return (
		<div className={classes.wrapper}>
			<div className={classes.paper}>
				<div className={classes.title}>{props.title}</div>
				{props.subtitle &&
					<div className={classes.subtitle}>{props.subtitle}</div>
				}
				<div className={classes.closeIcon} onClick={props.handleClose}>&times;</div>
				{props.children}
				<div className={classes.footer}>
					{props.handleSumit &&
						<Button variant="contained" color="primary" onClick={props.handleSumit}>
							Publish
            </Button>
					}
					{props.closeText &&
						<Button variant="contained" className={classes.closeBtn} onClick={props.handleClose}>
							{props.closeText}
						</Button>
					}
				</div>
			</div>
		</div>
	);
}
