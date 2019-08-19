import React, { PureComponent } from 'react';
import { BtnActive, BtnInactive, Loading } from './utils';

class Button extends PureComponent {
  _handleClick = e => {
    const { props } = this;
    props.loading || (props.onClick && props.onClick(e));
  };

  render() {
    const { disabled, children, loading, width, height } = this.props;
    return (
      <>
        {disabled ? (
          <BtnInactive width={width}>{children}</BtnInactive>
        ) : (
          <BtnActive onClick={this._handleClick} width={width} height={height}>
            {loading ? <Loading /> : children}
          </BtnActive>
        )}
      </>
    );
  }
}

Button.defaultProps = {
  disabled: false,
  loading: false,
  onClick() {},
  children: null,
  width: '',
  height: '',
  type: 'active',
};

export { Button };
export default Button;
