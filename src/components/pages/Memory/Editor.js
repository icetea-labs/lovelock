import React from 'react';
import Dante from 'Dante2';
import { withStyles } from '@material-ui/core/styles';
import mediumZoom from 'medium-zoom';
import Input from '@material-ui/core/Input';
import { DividerBlockConfig } from "Dante2/package/es/components/blocks/divider";

const font =
  '"jaf-bernino-sans", "Open Sans", "Lucida Grande", "Lucida Sans Unicode", "Lucida Sans", Geneva, Verdana, sans-serif';
const styles = {
  wrapper: {
    margin: '0 auto',
    maxWidth: 740,
    width: '100%',
    padding: '0 5%',
  },
  titleText: {
    fontFamily: font,
    fontSize: 64.8,
    fontWeight: 700,
    lineHeight: 1,
    marginBottom: 20,
  },
  subtitleText: {
    fontFamily: font,
    fontSize: 27,
    fontWeight: 300,
    lineHeight: 1.2,
    marginBottom: 20,
  },
};

class Editor extends React.Component {

  titleText = React.createRef();
  subtitleText = React.createRef();

  componentDidMount() {
    if (this.props.read_only) {
      setTimeout(() => {
        const images = document.querySelectorAll('.graf-image');
        if (images.length) {
          mediumZoom(images);
        }
      }, 500);
    } else {
      const titleInput = this.titleText.current;
      // for some reason, could not set this through react
      titleInput.style.letterSpacing = '-2.592px';
      titleInput.focus();

      const subtitleText = this.subtitleText.current;
      // for some reason, could not set this through react
      subtitleText.style.letterSpacing = '-0.54px';
    }
  }

  configWidgets = () => {
    const widgets = [ ...Dante.defaultProps.widgets ];
    const imgBlock = widgets[0];

    // remove the border when item is selected in view mode
    imgBlock.selected_class = this.props.read_only ? 'is-selected' : 'is-selected is-mediaFocused';

    widgets.push(DividerBlockConfig())

    return widgets;
  };

  configTooltips = () => {
    const tips = Dante.defaultProps.tooltips;

    // remove the H1 item on format toolbar
    const toolbar = tips[3];
    toolbar.widget_options.block_types = toolbar.widget_options.block_types.filter(e => e.label !== 'h2');
    toolbar.sticky = document.documentElement.clientWidth < 1175;
    return tips;
  };

  render() {
    const { classes, saveOptions } = this.props;
    const draftStorage = saveOptions
      ? {
          data_storage: saveOptions,
        }
      : {};

    return (
      <div className={classes.wrapper}>
        {!this.props.read_only && (
          <>
            <Input
              className={classes.titleText}
              inputRef={this.titleText}
              placeholder="Title"
              value={this.props.title}
              onChange={e => this.props.onTitleChange(e.target.value)}
              fullWidth
            />
            <Input
              className={classes.subtitleText}
              inputRef={this.subtitleText}
              placeholder="Subtitle (optional)"
              value={this.props.subtitle}
              onChange={e => this.props.onSubtitleChange(e.target.value)}
              fullWidth
            />
          </>
        )}
        <Dante
          content={this.props.initContent ? this.props.initContent : null}
          read_only={!!this.props.read_only}
          body_placeholder="Write content, paste or drag & drop photos..."
          widgets={this.configWidgets()}
          tooltips={this.configTooltips()}
          {...draftStorage}
          onChange={this.props.onChange}
        />
      </div>
    );
  }
}

export default withStyles(styles)(Editor);
