import styled from '@emotion/styled';
import Input from '@mui/joy/Input';
import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useMutation, useQuery } from 'urql';
import { graphql } from '../gql';

export default function SpaceName() {
  // TODO: Properly handle spaceId not being present
  const { spaceId = '' } = useParams<{ spaceId: string }>();

  const [queryResult] = useQuery({
    query: graphql(`
      query HeaderSpaceNameQuery($spaceId: UUID!) {
        result: space(id: $spaceId) {
          isReadOnly
          space {
            id
            name
          }
        }
      }
    `),
    requestPolicy: 'network-only',
    pause: !spaceId,
    variables: { spaceId },
  });

  const [name, setName] = useState<string>('');

  useEffect(() => {
    setName(queryResult.data?.result?.space.name ?? '');
  }, [queryResult.data?.result?.space.name]);

  const currentNameRef = useRef<string>(name);
  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const [, updateSpaceName] = useMutation(
    graphql(`
      mutation UpdateSpaceNameMutation($spaceId: ID!, $name: String!) {
        updateSpace(id: $spaceId, name: $name) {
          id
          name
        }
      }
    `),
  );
  const [isComposing, setIsComposing] = useState<boolean>(false);

  if (!spaceId) {
    return null;
  }

  if (queryResult.fetching) {
    return null;
  }

  if (queryResult.error || !queryResult.data?.result) {
    return null;
  }

  return isEditingName && !queryResult.data.result.isReadOnly ? (
    <SpaceNameInput
      ref={(element) => {
        element?.querySelector('input')?.focus();
      }}
      type="text"
      size="sm"
      placeholder="Enter a name for this space"
      slotProps={{
        input: {
          style: { textAlign: 'center' },
        },
      }}
      value={name}
      onChange={(e) => setName(e.target.value)}
      // This for handling IME (Input Method Editors) input,
      // e.g. Pinyin input. Using this technique to avoid triggering
      // the Enter key when user is still interacting with IME.
      onCompositionStart={() => setIsComposing(true)}
      onCompositionEnd={() => setIsComposing(false)}
      onKeyDown={(e) => {
        if (isComposing) {
          return;
        }

        if (e.key === 'Enter') {
          setIsEditingName(false);
          updateSpaceName({ spaceId, name });
        } else if (e.key === 'Escape') {
          setIsEditingName(false);
          setName(currentNameRef.current);
        }
      }}
    />
  ) : (
    <Name
      onClick={() => {
        currentNameRef.current = name;
        setIsEditingName(true);
      }}
    >
      {name || '[EMPTY]'}
    </Name>
  );
}

// ANCHOR: Styled Components

const SpaceNameInput = styled(Input)`
  width: 250px;
`;

const Name = styled.div`
  font-size: 14px;
`;
