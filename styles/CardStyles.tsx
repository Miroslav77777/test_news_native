import styled from 'styled-components/native';

export const CardContainer = styled.View`
    width: 99%;
    height: 150px;
    border-radius: 10px;
    border-width: 1px;
    border-color: #f0f0f0;
    margin-top: 10px;
    margin-bottom: 10px;
    flex-direction: row;
    background-color: #ffffff;

    position: relative;
    justify-content: space-between;
`;

export const CardImage = styled.Image`
    position: absolute;
    border-radius: 10px;
    left: -1;
    top: -1;
    width: 150px;
    height: 150px;
    background-color: #f0f0f0;
    padding: 1px;
`;

export const CardTextContainer = styled.View`
    flex: 1;
    justify-content: space-between;
    align-items: flex-end;
    height: 100%;
    padding: 15px 25px 15px 125px;
`;

export const CardTitleContainer = styled.View`
    height: fit-content;
    width: 100%;
    align-items: flex-end;
`;

export const CardDateSourceContainer = styled.View`
    width: 80%;
    height: 20px;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
`;