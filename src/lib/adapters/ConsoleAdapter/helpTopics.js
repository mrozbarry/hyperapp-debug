
const smallId = () => Math.random().toString(36).slice(2, 8);

const makeHelpTopic = ({ topic, summary, data = [] }, children = []) => {
  const id = smallId();

  return [
    {
      id,
      parent: null,
      topic,
      summary,
      data: [].concat(data),
    },
    ...children.map(c => ({ ...c, parent: c.parent || id })),
  ];
};

export const helpTopics = [
  ...makeHelpTopic({
    topic: 'Global methods and properties',
  }, [
    ...makeHelpTopic({
      topic: '$hyperappDebug.setApp',
      summary: 'function, select the default debugging adapter',
      data: [
        'This method sets the default debugging adapter, accessible using window.$hyperappDebug.$',
        'This method either accepts a debug id (set in your app props as { ..., debug: { id: "foo" } }), or the node your application mounts into',
        'If you use the node your application mounts into, be sure the root node in your view method and the node you are replacing in the DOM are the same tag. This will make it easy to inspect your HTML to find your tag, and use the special $0 in the console to target a DOM node.',
        'Usage 1: $hyperappDebug.setApp("debug id")',
        'Usage 2: $hyperappDebug.setApp(document.querySelector("#your-root-node"))',
        'Usage 3 (after inspecting root node): $hyperappDebug.setApp($0)',
      ],
    }),
    ...makeHelpTopic({
      topic: '$hyperappDebug.$',
      summary: 'property, the default debugging adapter',
      data: [
        'Returns the current default debugging adapter',
        'Usage 1: $hyperappDebug.$.<adapter function or property>',
      ],
    }),
    ...makeHelpTopic({
      topic: '$hyperappDebug.app',
      summary: 'function, access a registered debugging adapter',
      data: [
        'Returns a registered debugging adapter, or null if not found',
        'Usage 1: $hyperappDebug.app("debug id").<adapter function or property>',
      ],
    }),
    ...makeHelpTopic({
      topic: '$hyperappDebug.apps',
      summary: 'function, get a list of app adapters',
      data: [
        'Returns an array of adapters currently registered with the debugger',
        'Usage 1: $hyperappDebug.apps()',
      ],
    }),
    ...makeHelpTopic({
      topic: '$hyperappDebug.help',
      summary: 'function, output this help',
      data: [
        'Uses the browser console methods to output help topics by group',
        'Can accept a parameter to filter/search the help text (very basic/limited).',
        'Usage 1: $hyperappDebug.help()',
        'Usage 2: $hyperappDebug.help("search")',
      ],
    }),
  ]),
  ...makeHelpTopic({
    topic: 'Adapter methods and properties',
  }, [
    ...makeHelpTopic({
      topic: 'Time-travelling',
    }, [
      ...makeHelpTopic({
        topic: '<adapter>.pause',
        summary: 'function, pause the debuggable app',
        data: [
          'Prevents any new actions, effects, or state changes from running',
          'Anything attempted to be ran will be discarded and lost',
          'Usage 1: <adapter>.pause()',
        ],
      }),
      ...makeHelpTopic({
        topic: '<adapter>.resume',
        summary: 'function, resume the debuggable app',
        data: [
          'Allows new actions, effects, and state changes to run',
          'Only necessary to run if you have previously ran <adapter>.pause()',
          'Usage 1: <adapter>.resume()',
        ],
      }),
      ...makeHelpTopic({
        topic: '<adapter>.back',
        summary: 'function, time-travel debuggable app backwards',
        data: [
          'Travel the state of your application backwards in history',
          'This will automatically pause your application',
          'You can specify how many actions backward to travel, but the default is 1 action',
          'Usage 1: <adapter>.back()',
          'Usage 2: <adapter>.back(5)',
        ],
      }),
      ...makeHelpTopic({
        topic: '<adapter>.forward',
        summary: 'function, time-travel debuggable app forwards',
        data: [
          'Travel the state of your application forwards in history',
          'This will automatically pause your application',
          'You can specify how many actions forward to travel, but the default is 1 action',
          'You may also specify the time stream to move forward into if there are multiple by specifying an id. See <adapter>.alternateFutures method for more information',
          'Usage 1: <adapter>.forward()',
          'Usage 2: <adapter>.forward(5)',
          'Usage 2: <adapter>.forward(1, "time stream aciton id")',
        ],
      }),
      ...makeHelpTopic({
        topic: '<adapter>.resumeHere',
        summary: 'function, resume from current action',
        data: [
          'This allows you to resume the app form the current action, even if you have time travelled',
          'If you have time travelled, and time travel back to this point, the <adapter>.alternateFutures method can help you move forward again',
          'Usage 1: <adapter>.resumeHere()',
        ],
      }),
      ...makeHelpTopic({
        topic: '<adapter>.alternateFutures',
        summary: 'function, list of alternate futures from current action',
        data: [
          'Returns an array of action ids, their states, and the time they were created',
          'Usage 1: <adapter>.alternateFutures()',
        ],
      }),
    ]),
    ...makeHelpTopic({
      topic: 'State manipulation',
    }, [
      ...makeHelpTopic({
        topic: '<adapter>.restoreFromActionId',
        summary: 'function, reset the state using a previously ran action',
        data: [
          'Override the current state with the result of a previous action',
          'Action ids are output as part of the action logging, and may look something like "ActionName.<random hash>"',
          'Usage 1: <adapter>.restoreFromActionId("yourActionIdHere")',
        ],
      }),
      ...makeHelpTopic({
        topic: '<adapter>.dispatch',
        summary: 'function, run the application dispatch',
        data: [
          'Dispatch an action, side-effect, or force a state update',
          'A third boolean argument toggles whether (true) this dispatch adds to history, or (false) this dispatch does not change history',
          'Setting the third parameter only has purpose when using the action and props variant of dispatch',
          'If you are not sure how to use this, you should check out the hyperapp tutorial:',
          'https://github.com/jorgebucaran/hyperapp/blob/main/docs/tutorial.md',
          'Usage 1: <adapter>.dispatch(someActionMethod, actionProps)',
          'Usage 2: <adapter>.dispatch(someActionMethod, actionProps, false)',
          'Usage 3: <adapter>.dispatch([someEffectMethod, effectProps])',
          'Usage 4: <adapter>.dispatch([someEffectMethod, effectProps])',
          'Usage 3: <adapter>.dispatch({ ...state override })',
        ],
      }),
    ]),
    ...makeHelpTopic({
      topic: 'Observation',
    }, [
      ...makeHelpTopic({
        topic: '<adapter>.history',
        summary: 'function, see the current history array',
        data: [
          'Returns an array of the previous actions with their resulting state, effects, and subscriptions',
          'Usage 1: <adapter>.history()',
        ],
      }),
      ...makeHelpTopic({
        topic: '<adapter>.state',
        summary: 'function, see the current state',
        data: [
          'Return the current application state object',
          'This method respects any time travelling done through the debugger',
          'Usage 1: <adapter>.state()',
        ],
      }),
      ...makeHelpTopic({
        topic: '<adapter>.subscriptions',
        summary: 'function, see the current subscriptions',
        data: [
          'Return the current subscriptions array',
          'This method respects any time travelling done through the debugger',
          'Usage 1: <adapter>.state()',
        ],
      }),
      ...makeHelpTopic({
        topic: '<adapter>.logging',
        summary: 'function, change what is being logged out',
        data: [
          'Returns object with which things are being logged',
          'With no arguments, it simply returns the current logging rules',
          'With a string argument, you can set "action", "state", "effects", and "subscriptions", which will enable those items being logged',
          'Prefixing the string with a "!" will disable one of those log streams',
          'With an object argument, you can merge in an object containing the above strings as keys with boolean values',
          'Usage 1: <adapter>.logging()',
          'Usage 2: <adapter>.logging("state")',
          'Usage 3: <adapter>.logging("!effects")',
          'Usage 4: <adapter>.logging({ state: false, subscriptions: true })',
        ],
      }),
    ]),
  ]),
];

