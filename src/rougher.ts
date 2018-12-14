import {JSDOM} from 'jsdom'
import {RoughSVG} from 'roughjs/bin/svg'
import {Options} from 'roughjs/bin/core'
import {parseString} from 'xml2js'

const rough = require('roughjs')
const fs = require('fs');

const filename = process.argv[2]
const dom = new JSDOM()
const d = dom.window.document
const svg = d.createElementNS("http://www.w3.org/2000/svg", "svg")
const rc: RoughSVG = rough.svg(svg)

fs.readFile(filename, 'utf8', (err: any, text: any) => {
    parseString(text, (err: any, result: any) => {
        const node = result.svg

        for (const i in node) {
            if (i !== '$') {
                convertChildNodes(i, node[i]).forEach((cn: SVGElement) => {
                    svg.appendChild(cn)
                })
            }
        }
        console.log('<?xml version="1.0" encoding="UTF-8"?>')
        const tmp = dom.window.document.createElement("div")
        const attrs = node['$']
        for (const i in attrs) {
            svg.setAttribute(i, attrs[i])
        }
        tmp.appendChild(svg)
        console.log(tmp.innerHTML)
    })
})

function convertChildNodes(elementName: string, node: any): SVGElement[] {
    const a = []
    for (const i in node) {
        a.push(convert(elementName, node[i]))
    }
    return a
}

function convertCompound(elementName: string, node: any) {
    const g: SVGElement = d.createElementNS("http://www.w3.org/2000/svg", elementName)
    for (const c in node) {
        if (c === '_') {
            g.appendChild(d.createTextNode(node['_']))
        } else if (c === '$') {
            const attrs = node['$']
            for (const a in attrs) {
                g.setAttribute(a, attrs[a])
            }
        } else {
            convertChildNodes(c, node[c]).forEach((cn: SVGElement) => {
                g.appendChild(cn)
            })
        }
    }
    return g
}

function convert(elementName: string, node: any): SVGElement {
    const options: Options | any = extractStyle(node['$'])
    const tag = elementName.toLowerCase()
    switch (tag) {
        case 'g':
            return convertCompound(tag, node)
        case 'text':
            return convertCompound(tag, node)
        case 'tspan':
            return convertCompound(tag, node)
        case 'path':
            return rc.path(options['d'], options)
        case 'line':
            return rc.line(
                parseFloat(options['x1']),
                parseFloat(options['y1']),
                parseFloat(options['x1']),
                parseFloat(options['y2']),
                options
            )
        case 'rect':
            return rc.rectangle(
                parseFloat(options['x']),
                parseFloat(options['y']),
                parseFloat(options['width']),
                parseFloat(options['height']),
                options
            )
        case 'ellipse':
            return rc.ellipse(
                parseFloat(options['cx']),
                parseFloat(options['cy']),
                parseFloat(options['rx']),
                parseFloat(options['ry']),
                options
            )
        case 'circle':
            return rc.circle(
                parseFloat(options['cx']),
                parseFloat(options['cy']),
                parseFloat(options['r']),
                options
            )
        case 'polygon':
            throw elementName
        default:
            throw elementName
    }
}

function extractStyle(attributes: {[key: string]: string}): any {
    const options: {[key: string]: any } = {
        hachureGap: 2.0,
        fillWeight: 0.6,
        roughness: 2.0
    }
    if (attributes !== undefined) {
        const style = attributes['style']
        if (style !== undefined) {
            style.split(';').forEach((c: string) => {
                const a = c.split(':')
                if (a === undefined || a[0] === undefined || a[1] === undefined) {
                    console.error(a)
                } else {
                    const k = a[0].replace(/[-_](.)/g, function(match, group1) {
                        return group1.toUpperCase()
                    })
                    options[k.trim()] = a[1].trim()
                }
            })
        }
        for (const i in attributes) {
            const k = i.replace(/[-_](.)/g, function(match, group1) {
                return group1.toUpperCase()
            })
            options[k] = attributes[i]
        }
    }
    return options
}
