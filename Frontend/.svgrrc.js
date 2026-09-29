module.exports = {
  icon: true,
  ext: 'tsx',
  typescript: true,
  index: false,
  prettier: true,
  prettierConfig: {
    semi: false,
    singleQuote: true,
  },
  svgProps: {
    'aria-hidden': 'true',
  },
  svgoConfig: {
    plugins: [
      {
        name: 'preset-default',
        params: {
          overrides: {
            cleanupIds: {
              remove: true,
              minify: false,
              preservePrefixes: ['SVGID_', 'face_', 'gradient_', 'clip_'],
            },
            removeViewBox: false,
          },
        },
      },
      {
        name: 'convertStyleToAttrs',
      },
      {
        name: 'removeUnknownsAndDefaults',
        params: {
          unknownAttrs: true,
          defaultAttrs: true,
          uselessOverrides: true,
          keepDataAttrs: true,
          keepAriaAttrs: true,
          keepRoleAttr: true,
        },
      },
      {
        name: 'removeXlink',
        params: {
          includeLegacy: true,
        },
      },
    ],
  },
  template: (variables, { tpl }) => {
    return tpl`
      import type { SVGProps } from 'react'
      
      const ${variables.componentName} = (props: SVGProps<SVGSVGElement>) => (
        ${variables.jsx}
      )
      
      export default ${variables.componentName}
    `
  },
}
