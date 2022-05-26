import styled from '@emotion/styled';
import { LightbulbOutlined } from '@mui/icons-material';
import { Tooltip, tooltipClasses, TooltipProps } from '@mui/material';
import React, { Fragment } from 'react'

const LayersHelpTooltipComponent = () => {
    const HtmlTooltip = styled(({ className, ...props }: TooltipProps) => <Tooltip {...props} classes={{ popper: className }} />)(({ theme }) => ({
        [`& .${tooltipClasses.tooltip}`]: {
          backgroundColor: "#f5f5f9",
          color: "rgba(0, 0, 0, 0.87)",
          maxWidth: 320,
          fontSize: "12px",
          border: "1px solid #dadde9",
        },
      }));

  return (
    <HtmlTooltip arrow
    title={
      <Fragment>
        <em>Each layer represents a folder that contains different images (traits) for that layer.</em>
        <p>
          <em>
            For instance, a <b>face</b> layer will contain the different types of faces for your project
          </em>
        </p>

        <p>
          {" "}
          <em>
            You can assign rarity by adding <b>#</b> and a number to your file names.
          </em>
        </p>

        <p>
          <em>If your faces folder contains two files, e.g <b>blue-eyes.png</b> and <b>brown-eyes.png</b>, you can rename them thus</em>{" "}
        </p>

        <p>
          {" "}
          <em>
            <b>blue-eyes#15.png</b> and <b>brown-eyes#85.png</b> this means that for every 100 NFTs generated, blue-eyes will appear 15
            times and brown-eyes will appear 85 times
          </em>
        </p>
        <p>
          <em>
            Typical layer names are <b>head</b>,<b>face</b>,<b>eyes</b>,<b>mouth</b>
          </em>
        </p>
        <p>
          <em>
            Layers should be added in the order you wish to combine them. For instance if you want to draw the face first, then the eyes and then the nose, your layers should be ordered thus <b>face,eyes,nose</b>
          </em>
        </p>   
        <p>
          <a href="https://ipfs.io/ipfs/bafkreicwfzj7f3xc6mjkyaqknd4gsosscznelpiwdtwmdp773irwuv2lqu">Here</a> is a sample layers folder you can use as reference
        </p>     
      </Fragment>
    }>
    <LightbulbOutlined />
  </HtmlTooltip>
  )
}

export default LayersHelpTooltipComponent;