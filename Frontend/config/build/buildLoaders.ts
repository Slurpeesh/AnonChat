import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import ReactRefreshTypescript from 'react-refresh-typescript'
import { ModuleOptions } from 'webpack'
import { BuildOptions } from './types/types'

export function buildLoaders({ mode }: BuildOptions): ModuleOptions['rules'] {
  const isDev = mode === 'development'

  const assetLoader = {
    test: /\.(png|jpg|jpeg|gif|woff2)$/i,
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
    use: [
      {
        loader: 'ts-loader',
        options: {
          transpileOnly: isDev,
          getCustomTransformers: () => {
            before: [isDev && ReactRefreshTypescript()].filter(Boolean)
          },
        },
      },
    ],
    exclude: /node_modules/,
  }

  return [assetLoader, cssFullLoader, tsLoader]
}
