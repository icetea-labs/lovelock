import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Select from 'rc-select';
import Pagination from 'rc-pagination';
import localeInfo from 'rc-pagination/lib/locale/en_US';
import 'rc-pagination/assets/index.css';
import 'rc-select/assets/index.css';

const Wrapper1 = styled.div`
  margin-top: 10px;
  display: flex;
  justify-content: flex-end;
  .rc-pagination-item-active {
    background-color: #15b5dd;
    border-color: #15b5dd;
  }
  .rc-pagination-item:hover {
    border-color: #15b5dd;
  }
  .rc-pagination-options:hover {
    border-color: #15b5dd;
  }

  .rc-pagination-item:hover a {
    color: #15b5dd;
  }
  .rc-pagination-options-quick-jumper input:hover {
    border-color: #15b5dd;
  }
  .rc-select-enabled .rc-select-selection:hover {
    border-color: #15b5dd;
    box-shadow: 0 0 2px #15b5dd;
  }
  .rc-select-enabled .rc-select-selection:active {
    border-color: #15b5dd;
  }
  .rc-select-focused .rc-select-selection {
    border-color: #15b5dd;
    box-shadow: 0 0 2px #15b5dd;
  }
  .rc-pagination-item-active:hover a {
    color: rgb(255, 255, 255);
  }
  .rc-pagination-item {
    width: 32px;
    height: 32px;
    line-height: 32px;
    font-size: 13px;
    border-width: 1px;
    border-style: solid;
    /* border-color: rgb(132, 142, 156); */
    border-image: initial;
    outline: none;
  }
`;

const Wrapper2 = styled.div`
  display: flex;
  font-family: 'DIN';
  .rc-pagination-item {
    width: 32px;
    height: 32px;
    line-height: 32px;
    border: 1px solid #848e9c;
    font-size: 13px;
    outline: none;
  }
  .rc-pagination-prev,
  .rc-pagination-next,
  .rc-pagination-jump-prev,
  .rc-pagination-jump-next {
    cursor: pointer;
    color: #212833;
    font-size: 10px;
    border-radius: 6px;
    list-style: none;
    width: 32px;
    height: 32px;
    line-height: 32px;
    float: left;
    text-align: center;
    outline: none;
  }
  .rc-pagination-item:hover {
    border-color: #15b5dd;
  }
  .rc-pagination-item:hover a {
    color: #15b5dd;
  }
  .rc-pagination-item-active {
    background-color: #15b5dd;
    border-color: #15b5dd;
    &:hover a {
      color: #fff;
    }
  }
  .rc-pagination-jump-prev:hover:after,
  .rc-pagination-jump-next:hover:after {
    color: #15b5dd;
  }
  /* Add */
  .rc-pagination-options-quick-jumper {
    height: 32px;
    line-height: 32px;
  }
  .rc-pagination-options-quick-jumper input {
    height: 32px;
  }
  .rc-pagination-options-quick-jumper input:hover {
    border-color: #15b5dd;
  }
  .rc-pagination-options-quick-jumper button:active,
  .rc-pagination-options-quick-jumper button:focus,
  .rc-pagination-options-quick-jumper button:hover {
    color: #15b5dd;
    background-color: #fff;
    border-color: #15b5dd;
  }
  /* select */
  .rc-select-selection--single .rc-select-selection__rendered {
    height: 32px;
    line-height: 32px;
  }
  .rc-select-selection--multiple .rc-select-selection__rendered .rc-select-selection__choice {
    margin-top: 4px;
    line-height: 20px;
  }
  .rc-select-selection--single {
    height: 32px;
    line-height: 32px;
  }
`;

class PaginationPro extends PureComponent {
  onShowSizeChange = (current, pageSize) => {
    const { onShowSizeChange } = this.props;

    onShowSizeChange && onShowSizeChange(current, pageSize);
  };

  onChange = (current, pageSize) => {
    const { onChange } = this.props;

    onChange(current, pageSize);
  };

  render() {
    const { total, defaultPageSize, defaultCurrent, showQuickJumper, showSizeChanger } = this.props;

    return (
      <Wrapper1>
        <Wrapper2>
          <Pagination
            selectComponentClass={Select}
            showQuickJumper={!!showQuickJumper}
            showSizeChanger={!!showSizeChanger}
            defaultPageSize={defaultPageSize}
            defaultCurrent={defaultCurrent}
            onShowSizeChange={this.onShowSizeChange}
            onChange={this.onChange}
            total={total}
            locale={localeInfo}
          />
        </Wrapper2>
      </Wrapper1>
    );
  }
}

PaginationPro.propTypes = {
  defaultCurrent: PropTypes.number,
  defaultPageSize: PropTypes.number,
  total: PropTypes.number,
  onShowSizeChange: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
  onChange: PropTypes.func,
};

PaginationPro.defaultProps = {
  defaultCurrent: 1,
  defaultPageSize: 10,
  total: 0,
  onShowSizeChange: {},
  onChange: {},
};
export default PaginationPro;
