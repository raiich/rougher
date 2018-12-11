import {JSDOM } from 'jsdom'
import {RoughSVG } from "roughjs/bin/svg"
import {Options} from "roughjs/bin/core";

const parse = require('xml-parser');
const rough = require('roughjs')
const fs = require('fs');

const filename = process.argv[2]
const dom = new JSDOM()
const tempDocument = dom.window.document
const svg = tempDocument.createElementNS("http://www.w3.org/2000/svg", "svg")
const rc = rough.svg(svg)

fs.readFile(filename, 'utf8', (err: any, text: any) => {
    const xml = parse(text, 'text/xml')
    xml.root.children.forEach((n: any) => {
        svg.appendChild(convert(rc, n))
    })
    console.log('<?xml version="1.0" encoding="UTF-8"?>')
    const tmp = dom.window.document.createElement("div")
    for (const i in xml.root.attributes) {
        svg.setAttribute(i, xml.root.attributes[i])
    }
    tmp.appendChild(svg);
    console.log(tmp.innerHTML)
})

function convert(rc: RoughSVG, node: any): SVGGElement {
    const options = extractStyle(node.attributes)
    //const options = {fill: 'red', stroke: 'black'}
    switch (node.name.toLowerCase()) {
        case 'path':
            return rc.path(node.attributes['d'], options)
        case 'line':
            return rc.line(
                parseFloat(node.attributes['x1']),
                parseFloat(node.attributes['y1']),
                parseFloat(node.attributes['x1']),
                parseFloat(node.attributes['y2']),
                options
            )
        case 'rect':
            return rc.rectangle(
                parseFloat(node.attributes['x']),
                parseFloat(node.attributes['y']),
                parseFloat(node.attributes['width']),
                parseFloat(node.attributes['height']),
                options
            )
        case 'ellipse':
            return rc.ellipse(
                parseFloat(node.attributes['cx']),
                parseFloat(node.attributes['cy']),
                parseFloat(node.attributes['rx']),
                parseFloat(node.attributes['ry']),
                options
            )
        case 'circle':
            return rc.circle(
                parseFloat(node.attributes['cx']),
                parseFloat(node.attributes['cy']),
                parseFloat(node.attributes['r']),
                options
            )
        case 'polygon':
            break
        default:
            const g = tempDocument.createElementNS("http://www.w3.org/2000/svg", node.name.toLowerCase())
            const gAttributes = node.attributes
            if (gAttributes !== undefined) {
                for (const i in gAttributes) {
                    g.setAttribute(i, gAttributes[i])
                }
            }
            if (node.content !== undefined) {
                const t = tempDocument.createTextNode(node.content)
                g.appendChild(t)
            }
            node.children.map((c: any) => convert(rc, c)).forEach((c: any) => g.appendChild(c))
            return g
    }
    return tempDocument.createElement(node.name, node.attributes)
}

function extractStyle(attributes: {[key: string]: string}): Options {
    const options: {[key: string]: string; } = {}
    if (attributes !== undefined) {
        const style = attributes['style']
        if (style !== undefined) {
            style.split(';').forEach((c: string) => {
                const a = c.split(':')
                if (a === undefined || a[0] === undefined || a[1] === undefined) {
                    console.error(a)
                } else {
                    options[a[0].trim()] = a[1].trim()
                }
            })
        }
        for (const i in attributes) {
            options[i] = attributes[i]
        }
    }
    return options
}
