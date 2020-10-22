import React from 'react';
import QueueAnim from 'rc-queue-anim';
import { useSelector } from 'react-redux';
import { LayoutAuthen, BoxAuthen, ShadowBoxAuthen } from '../../../elements/StyledUtils';
import RegisterSuccess from './RegisterSuccess';

export default function RegisterIceteaId() {
  const step = useSelector((state) => state.create.step);

  return (
    <>
      {step === 'five' && (
        <QueueAnim delay={200} type={['top', 'bottom']}>
          <LayoutAuthen key={1}>
            <BoxAuthen>
              <ShadowBoxAuthen>
                <>
                  <RegisterSuccess />
                </>
              </ShadowBoxAuthen>
            </BoxAuthen>
          </LayoutAuthen>
        </QueueAnim>
      )}
    </>
  );
}
