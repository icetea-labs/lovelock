import React from 'react';
import styled from 'styled-components';
import { rem } from '../../../elements/StyledUtils';
import { useSelector } from 'react-redux';

const WarrperPromise = styled.div`
  display: flex;
  margin-bottom: ${rem(20)};
  padding: ${rem(5)};
  min-height: ${rem(36)};
  :hover {
    cursor: pointer;
    background: #f5f2f0;
    border-radius: 5px;
  }
  .icon {
    img {
      width: ${rem(36)};
      height: ${rem(36)};
      border-radius: 50%;
      margin-right: ${rem(10)};
    }
  }
  .name {
    color: #5a5e67;
    text-transform: capitalize;
  }
  .nick {
    color: #8250c8;
    font-size: ${rem(12)};
  }
  .empty {
    color: #5a5e67;
  }
`;

export default function LeftProposes(props) {
  const propose = useSelector(state => state.loveinfo.propose);
  const pendingPropose = propose.filter(item => item.status === props.flag);
  if (pendingPropose.length <= 0) {
    return (
      <WarrperPromise>
        <div className="empty">Not yet</div>
      </WarrperPromise>
    );
  }
  return pendingPropose.map(item => {
    // console.log('item', item.name);
    return (
      <WarrperPromise
        key={item.id}
        onClick={() => {
          props.handlerSelect(item.id);
        }}
      >
        <div className="icon">
          <img src="/static/img/user-women.jpg" alt="avata" />
        </div>
        <div className="pri_info">
          <div className="name">{item.name}</div>
          <div className="nick">{item.nick}</div>
        </div>
      </WarrperPromise>
    );
  });
}
