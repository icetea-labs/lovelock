import React, {useEffect, useState} from 'react';
import Link from "@material-ui/core/Link";
import Linkify from "react-linkify";

export default function UserLinkify(props) {
  const { content } = props;
  const [modifiedContent, setModifiedContent] = useState('');

  useEffect(() => {
    const nameRegex = /@\[(.+?)\]/g;
    const splitContent = content.split(nameRegex);

    for (let i = 1; i < splitContent.length; i += 2) {
      const [username, displayName] = splitContent[i].split('-');
      splitContent[i] = <Link href={`/u/${username}`} key={i}>{displayName}</Link>;
    }

    setModifiedContent(splitContent);
  }, [content]);

  return (
    <Linkify>{modifiedContent}</Linkify>
  );
}
