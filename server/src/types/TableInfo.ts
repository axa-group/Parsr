/**
 * Copyright 2019 AXA
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

export class TableInfoPage {
	trimbox_coordinates: Box;
	tables_trimbox_coordinates: Box[];
	tables_mediabox_coordinates: Box[];
	mediabox_dims: Dim;
	filename: string;
	class_ids: number[];
	page_number: number;
	scores: number[];
}

export class Box {
	x1: number;
	x2: number;
	y1: number;
	y2: number;
}

export class Dim {
	height: number;
	width: number;
}
