import React, { Component } from 'react';
import '../../assets/sass/read-more.css';

const ELLIPSES = '…';
const SHOW_LESS_TEXT = 'Show Less';
const SHOW_MORE_TEXT = 'Read More';

export default class ReadMore extends Component {
  //   static defaultProps = {
  //     numberOfLines: 2,
  //     lineHeight: 1,
  //     readMoreCharacterLimit: 100,
  //     showLessButton: false,
  //   };

  constructor(props) {
    super(props);
    this.state = { showingAll: false };
  }

  componentDidMount() {
    // this.props.onContentChange();
  }

  toggleReadMore = () => {
    this.setState({
      showingAll: !this.state.showingAll,
    });
  };

  getReadMoreParts = ({ text, numberOfLines, readMoreCharacterLimit }) => {
    let teaserText;
    let remainingText;
    const remainingWordsArray = [];

    if (text) {
      const teaserWordsArray = text.split(' ');

      while (teaserWordsArray.join(' ').length > readMoreCharacterLimit) {
        remainingWordsArray.unshift(teaserWordsArray.pop());
      }

      teaserText = teaserWordsArray.join(' ');

      if (remainingWordsArray.length > 0) {
        remainingText = remainingWordsArray.join(' ');
      }
    }

    return {
      teaserText,
      remainingText,
    };
  };

  getText = ({ showingAll, text, readMoreCharacterLimit, numberOfLines }) => {
    const { teaserText, remainingText } = this.getReadMoreParts({ text, numberOfLines, readMoreCharacterLimit });

    if (!showingAll && text.length > readMoreCharacterLimit) {
      return (
        <span>
          {teaserText.replace(/\s*$/, '')}
          <span className="read-more__text--remaining read-more__text--hide">{remainingText}</span>
          {ELLIPSES}
        </span>
      );
    }

    return (
      <span>
        {teaserText}
        <span className="read-more__text--remaining read-more__text--show">{remainingText}</span>
      </span>
    );
  };

  getActionButton = ({ showingAll, showLessButton }) => {
    if (showingAll && !showLessButton) {
      return;
    }

    const buttonText = showingAll ? SHOW_LESS_TEXT : SHOW_MORE_TEXT;

    return (
      <button onClick={this.toggleReadMore} className="read-more__button">
        {buttonText}
      </button>
    );
  };

  render() {
    const { text, readMoreCharacterLimit, showLessButton, numberOfLines, lineHeight } = this.props;

    // console.log(numberOfLines, lineHeight, numberOfLines * lineHeight);
    // const maxHeight = numberOfLines * lineHeight;
    const style = {
      lineHeight,
    //   maxHeight: `${maxHeight}em`,
    };
    const { showingAll } = this.state;
    const textToDisplay = this.getText({ showingAll, text, readMoreCharacterLimit, numberOfLines });
    const actionButton = this.getActionButton({ showingAll, showLessButton });

    return (
      <div className="read-more" style={style}>
        {textToDisplay} {actionButton}
      </div>
    );
  }
}
