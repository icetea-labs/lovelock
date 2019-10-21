import React, { useEffect } from 'react';
import Dante from 'Dante2';
import { withStyles } from '@material-ui/core/styles';
import mediumZoom from 'medium-zoom';
import Input from '@material-ui/core/Input';

const font =
  '"jaf-bernino-sans", "Open Sans", "Lucida Grande", "Lucida Sans Unicode", "Lucida Sans", Geneva, Verdana, sans-serif';
const styles = {
  wrapper: {
    margin: '0 auto',
    maxWidth: 740,
    width: '100%',
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
  readonly = !!this.props.read_only;
  state = {
    title: '',
    subtitle: '',
  };

  componentDidMount() {
    if (this.readonly) {
      setTimeout(() => {
        const images = document.querySelectorAll('.graf-image');
        if (images.length) {
          mediumZoom(images);
        }
      }, 500);
    } else {
      const title = document.getElementById('danteEditorTitle');
      if (title) {
        // for some reason, could not set this through react
        title.style.letterSpacing = '-2.592px';
        title.focus();
      }
      const subtitle = document.getElementById('danteEditorSubtitle');
      if (subtitle) {
        // for some reason, could not set this through react
        subtitle.style.letterSpacing = '-0.54px';
      }
    }
  }

  configWidgets = () => {
    const widgets = Dante.defaultProps.widgets;
    const imgBlock = widgets[0];

    // remove the border when item is selected in view mode
    imgBlock.selected_class = this.readonly ? 'is-selected' : 'is-selected is-mediaFocused';

    return widgets;
  };

  configTooltips = () => {
    const tips = Dante.defaultProps.tooltips;
    // remove the H1 item on format toolbar
    tips[3].widget_options.block_types = tips[3].widget_options.block_types.filter(e => e.type !== 'header-one');
    return tips;
  };

  combineContent = content => {
    const title = this.state.title;
    const h1 = title && {
      data: {},
      depth: 0,
      entityRanges: [],
      inlineStyleRanges: [],
      key: 'lock0',
      text: title,
      type: 'header-one',
    };
    const subtitle = this.state.subtitle;
    const h3 = subtitle && {
      data: {},
      depth: 0,
      entityRanges: [],
      inlineStyleRanges: [],
      key: 'lock1',
      text: subtitle,
      type: 'header-three',
    };

    if (!h1 && !h3) return content; // nothing to merge

    const combined = { ...content };
    combined.blocks = [...combined.blocks];
    if (h3) combined.blocks.unshift(h3);
    if (h1) combined.blocks.unshift(h1);

    return combined;
  };

  render() {
    const { classes } = this.props;
    return (
      <div className={classes.wrapper}>
        {!this.readonly && (
          <>
            <Input
              className={classes.titleText}
              id="danteEditorTitle"
              placeholder="Input title"
              value={this.state.title}
              onChange={e => this.setState({ title: e.target.value })}
              fullWidth
            />
            <Input
              className={classes.subtitleText}
              id="danteEditorSubtitle"
              placeholder="Subtitle (optional)"
              value={this.state.subtitle}
              onChange={e => this.setState({ subtitle: e.target.value })}
              fullWidth
            />
          </>
        )}
        <Dante
          content={this.props.initContent ? this.props.initContent : null}
          read_only={this.readonly}
          body_placeholder="Input content here"
          widgets={this.configWidgets()}
          tooltips={this.configTooltips()}
          onChange={editor => {
            editor.relocateTooltips();
            if (this.props.onChange) {
              this.props.onChange(this.combineContent(editor.save.editorContent));
            }
          }}
        />
      </div>
    );
  }
}

export default withStyles(styles)(Editor);
