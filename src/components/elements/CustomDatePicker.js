import React from 'react';
import { DatePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";
import styled from "styled-components";

export default function CustomDatePicker(props) {
  const DateBox = styled.div`
    height: 32px;
    line-height: 32px;
    width: 115px;
    color: #8250c8;
    border-radius: 18px;
    padding: 0 15px 0 10px;
    position: relative;
    z-index: 0;
    :hover {
      background: #ebedf0;
    }
    @media (max-width: 599.95px) {
      width: 100%;
      font-size: 14px;
    }
    cursor: pointer;
    input {
      cursor: pointer;
      z-index: 2;
      padding-left: 35px;
      font-size: 13px;
      color: #8250c8;
      @media (max-width: 599.95px) {
        width: 100%;
        font-size: 14px !important;
      }
    }
    .icon-datetime {
      display: flex;
      align-items: center;
    }
    i {
      position: absolute;
      left: 5px;
      top: 4px;
      z-index: 1;
    }
  `;
  
  return (
    <DateBox>
      <div className="icon-datetime">
        <i className="material-icons" style={{ paddingLeft: 12 }}>event</i>
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
          <DatePicker
            autoOk
            clearable={false}
            showTodayButton
            value={props.date}
            format="dd/MM/yyyy"
            disableFuture
            onChange={props.handleDateChange}
            onOpen={() => props.onDialogToggle && props.onDialogToggle(true)}
            onClose={() => props.onDialogToggle && props.onDialogToggle(false)}
            style={{ paddingTop: 2 }}
          />
        </MuiPickersUtilsProvider>
      </div>
    </DateBox>
  );
}
