import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import { ModuleOptions } from 'webpack'
import { BuildOptions } from './types/types'

export function buildLoaders({ mode }: BuildOptions): ModuleOptions['rules'] {
  const isDev = mode === 'development'

  const assetLoader = {
    test: /\.(png|jpg|jpeg|gif|woff2|mp3)$/i,
    type: 'asset/resource',
  }

  const cssLoaderWithModules = {
    loader: 'css-loader',
  }

  const postCssLoader = {
    loader: 'postcss-loader',
    options: { sourceMap: true },
  }

  const cssFullLoader = {
    test: /\.css$/i,
    use: [
      isDev ? 'style-loader' : MiniCssExtractPlugin.loader,
      cssLoaderWithModules,
      postCssLoader,
    ],
  }

  const tsLoader = {
    test: /\.tsx?$/,
    exclude: /node_modules/,
    use: [
      {
        loader: 'swc-loader',
        options: {
          jsc: {
            parser: {
              syntax: 'typescript',
              tsx: true,
              decorators: false,
              dynamicImport: true,
            },
            transform: {
              react: {
                runtime: 'automatic',
                development: isDev,
                refresh: isDev,
              },
            },
            target: 'es2020',
          },
          sourceMaps: isDev,
        },
      },
    ],
  }

  return [assetLoader, cssFullLoader, tsLoader]
}
